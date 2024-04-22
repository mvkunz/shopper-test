import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { writeFile, readFile, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductService {
  private prisma: PrismaClient;
  private uploadsDir = './uploads';

  constructor() {
    this.prisma = new PrismaClient();
  }

  async validateCSV(buffer: Buffer): Promise<any> {
    await this.clearUploads(); //Chamando somente por conta do teste onde será feito por um usuário somente, no futuro da pra tirar e nao excluir mais.

    const content = buffer.toString();
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    });

    const results = [];
    const errors = [];
    const priceUpdates = new Map<number, number>(
      records.map((r) => [parseInt(r.product_code), parseFloat(r.new_price)]),
    );

    for (const row of records) {
      try {
        const validationResult = await this.validateRow(row, priceUpdates);
        results.push({
          product_code: row.product_code,
          new_price: row.new_price,
          product_name: validationResult.product_name,
          cost_price: validationResult.cost_price,
          sales_price: validationResult.sales_price,
          status: 'Valid',
        });
      } catch (error) {
        const product = await this.prisma.product.findUnique({
          where: { code: parseInt(row.product_code) },
          select: {
            name: true,
            costPrice: true,
            salesPrice: true,
          },
        });

        errors.push({
          product_code: row.product_code,
          new_price: row.new_price,
          product_name: product?.name || 'Unknown Product',
          cost_price: product?.costPrice || 0,
          sales_price: product?.salesPrice || 0,
          status: 'Invalid',
          reason: error.message,
        });
      }
    }

    if (errors.length === 0) {
      const fileId = uuidv4();
      const filePath = join(this.uploadsDir, `${fileId}.csv`);
      await writeFile(filePath, buffer);
      return { results, fileId };
    } else {
      return { results, errors };
    }
  }

  async updatePrices(fileId: string): Promise<any> {
    const filePath = join(this.uploadsDir, `${fileId}.csv`);
    try {
      const buffer = await readFile(filePath);
      const content = buffer.toString();
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      });

      for (const row of records) {
        await this.prisma.product.update({
          where: { code: parseInt(row.product_code) },
          data: { salesPrice: parseFloat(row.new_price) },
        });
      }

      const packs = await this.prisma.pack.findMany({
        include: { product: true },
      });
      for (const pack of packs) {
        const components = await this.prisma.pack.findMany({
          where: { packId: pack.packId },
          include: { product: true },
        });

        const newCostPrice = components.reduce((sum, component) => {
          return (
            sum + Number(component.product.costPrice) * Number(component.qty)
          );
        }, 0);

        await this.prisma.product.update({
          where: { code: pack.packId },
          data: { costPrice: Number(newCostPrice) },
        });
      }

      await unlink(filePath); // Remove o arquivo após a atualização

      return { success: true, message: 'Preços atualizados com sucesso.' };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Arquivo não encontrado.');
      }
      console.error('Erro ao atualizar preços:', error);
      throw new BadRequestException('Erro ao atualizar preços.');
    }
  }

  private async validateRow(
    row: any,
    priceUpdates: Map<number, number>,
  ): Promise<{
    product_name: string;
    cost_price: number;
    sales_price: number;
  }> {
    console.log('row', row);

    if (!row.product_code || !row.new_price) {
      throw new BadRequestException('Código ou novo preço não especificado.');
    }

    const product = await this.prisma.product.findUnique({
      where: { code: parseInt(row.product_code) },
    });

    if (!product) {
      throw new BadRequestException('Produto não encontrado.');
    }

    const newPrice = parseFloat(row.new_price);
    if (isNaN(newPrice)) {
      throw new BadRequestException('Novo preço não é um número válido.');
    }

    if (newPrice < product.costPrice) {
      throw new BadRequestException('O novo preço está abaixo do custo.');
    }

    const priceChange =
      Math.abs(product.salesPrice - newPrice) / product.salesPrice;
    if (priceChange > 0.1) {
      throw new BadRequestException('Reajuste de preço maior que 10%.');
    }

    // Verificação adicional para pacotes
    const components = await this.prisma.pack.findMany({
      where: { packId: product.code },
      include: { product: true },
    });

    if (components.length > 0) {
      let calculatedPackPrice = 0;
      for (const component of components) {
        const componentPrice = priceUpdates.get(Number(component.productId));
        if (componentPrice === undefined) {
          throw new BadRequestException(
            `Preço para componente ${component.productId} do pacote ${product.code} não especificado.`,
          );
        }
        calculatedPackPrice += componentPrice * Number(component.qty);
      }
      if (Math.abs(calculatedPackPrice - newPrice) > 0.01) {
        throw new BadRequestException(
          `O preço do pacote ${product.code} não corresponde à soma dos preços dos componentes.`,
        );
      }
    }
    if (!product) {
      throw new BadRequestException('Produto não encontrado.');
    }

    return {
      product_name: product.name,
      cost_price: product.costPrice,
      sales_price: product.salesPrice,
    };
  }
  async clearUploads(): Promise<void> {
    try {
      const files = await readdir(this.uploadsDir);
      await Promise.all(
        files.map((file) => unlink(join(this.uploadsDir, file))),
      );
    } catch {
      throw new BadRequestException('Error cleaning uploads directory');
    }
  }
}
