import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-validate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndValidate(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo foi enviado.');
    return this.productService.validateCSV(file.buffer);
  }

  @Post('update-prices/:fileId')
  updatePrices(@Param('fileId') fileId: string) {
    return this.productService.updatePrices(fileId);
  }
}
