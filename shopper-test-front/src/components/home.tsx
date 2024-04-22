import React, { useState } from "react";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
  TableCell,
} from "@/components/ui/table";

export function Home() {
  const [file, setFile] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isValidateButtonDisabled, setIsValidateButtonDisabled] =
    useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [fileUuid, setFileUuid] = useState(null);

  interface Item {
    product_code: number;
    product_name: string;
    cost_price: number;
    new_price: number;
    sales_price: number;
    reason?: string;
  }

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files ? event.target.files[0] : null;
    setFile(newFile);
    setIsValidateButtonDisabled(newFile === null);
  };

  const updatePrices = async () => {
    if (!fileUuid) {
      alert("Não há um arquivo validado para atualizar.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/products/update-prices/${fileUuid}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setFileUuid(null);
        setValidationResults([]);
        setValidationErrors([]);
        setIsButtonDisabled(true);
        setIsValidateButtonDisabled(true);
        setFile(null);
        setIsLoading(false);
        alert("Preços atualizados com sucesso!");
      } else {
        alert("Falha ao atualizar os preços.");
      }
    } catch (error) {
      console.error("Erro ao atualizar os preços:", error);
      alert("Erro ao tentar atualizar os preços.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = async () => {
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "http://localhost:3000/products/upload-validate",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await response.json();

        setValidationResults(result.results);
        setValidationErrors(result.errors);
        setIsButtonDisabled(result.fileId ? false : true);
        setIsValidateButtonDisabled(true);
        if (result.fileId) {
          setFileUuid(result.fileId);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error sending file:", error);
        setIsLoading(false);
      }
    } else {
      alert("Please select a file before validating.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="max-w-3xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Atualização de Preços</CardTitle>
            <CardDescription>
              Faça o upload do arquivo de precificação e valide as informações
              antes de atualizar os preços.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo de Precificação</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
            <Button
              onClick={validateFile}
              disabled={isValidateButtonDisabled || isLoading}
            >
              {isLoading ? "Validando..." : "Validar"}
            </Button>
            <div className="grid gap-4">
              <h3 className="font-semibold">Resultados da Validação</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço Antigo</TableHead>
                    <TableHead>Preço de Custo</TableHead>
                    <TableHead>Novo Preço</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((item: Item) => (
                    <TableRow key={item.product_code}>
                      <TableCell>{item.product_code}</TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{formatCurrency(item.sales_price)}</TableCell>
                      <TableCell>{formatCurrency(item.cost_price)}</TableCell>
                      <TableCell>{formatCurrency(item.new_price)}</TableCell>
                      <TableCell>
                        {item.status === "Valid" ? (
                          <span
                            role="img"
                            aria-label="success"
                            style={{ color: "green" }}
                          >
                            ✅ Validado com sucesso
                          </span>
                        ) : (
                          <span style={{ color: "red" }}>{item.reason}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {validationErrors &&
                    validationErrors.length > 0 &&
                    validationErrors.map((error: Item) => (
                      <TableRow key={error.product_code}>
                        <TableCell>{error.product_code}</TableCell>
                        <TableCell>{error.product_name}</TableCell>
                        <TableCell>
                          {formatCurrency(error.sales_price)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(error.cost_price)}
                        </TableCell>
                        <TableCell>{formatCurrency(error.new_price)}</TableCell>
                        <TableCell>
                          <span style={{ color: "red" }}>
                            ❌ {error.reason}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updatePrices}
              disabled={isButtonDisabled || isLoading}
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </Button>
            <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              O botão só habilita após o CSV ser validado
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
