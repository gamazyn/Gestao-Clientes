import React from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Client } from "@/types/Client";
import { toast } from "./ui/use-toast";
import { Rest } from "@/services/client/rest.client";

const formSchema = z
  .object({
    nomeRazaoSocial: z.string().min(3).max(150),
    email: z.string().email(),
    cnpjCpf: z
      .string({
        required_error: "CPF/CNPJ é obrigatório.",
      })
      .refine((doc) => {
        const replacedDoc = doc.replace(/\D/g, "");
        return replacedDoc.length >= 11;
      }, "CPF/CNPJ deve conter no mínimo 11 caracteres.")
      .refine((doc) => {
        const replacedDoc = doc.replace(/\D/g, "");
        return replacedDoc.length <= 14;
      }, "CPF/CNPJ deve conter no máximo 14 caracteres.")
      .refine((doc) => {
        const replacedDoc = doc.replace(/\D/g, "");
        return !!Number(replacedDoc);
      }, "CPF/CNPJ deve conter apenas números.")
      .transform((value) => value.replace(/\D/g, "")),
    tipoPessoa: z.string(),
    telefone: z.string().max(11),
    inscricaoEstadual: z.string().transform((value) => value.replace(/\D/g, "")).optional(),
    inscricaoEstadualPessoaFisica: z.boolean().optional(),
    inscricaoEstadualIsento: z.boolean().optional(),
    genero: z.string().optional(),
    dataNascimento: z.date().optional(),
    status: z.string().transform((value) => (value === "active" ? 0 : 1)),
    password: z.string().min(8).max(15).optional(),
    passwordConfirmation: z.string().min(8).max(15).optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  })
  .refine(
    (data) => {
      if (data.tipoPessoa === "fisica") {
        return !!data.dataNascimento;
      }
      return true;
    },
    {
      message: "Data de nascimento é obrigatória para pessoa física.",
      path: ["dataNascimento"],
    },
  );

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function FormFull({ client, onClose }: { client?: Client, onClose: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeRazaoSocial: client?.nomeRazaoSocial || "",
      email: client?.email || "",
      cnpjCpf: client?.cnpjCpf || "",
      tipoPessoa: client?.tipoPessoa || "juridica",
      telefone: client?.telefone || "",
      inscricaoEstadual: client?.inscricaoEstadual || "",
      inscricaoEstadualPessoaFisica: false,
      inscricaoEstadualIsento: client?.inscricaoEstadualIsento || false,
      genero: client?.genero || "",
      dataNascimento: client?.dataNascimento ? new Date(client.dataNascimento) : undefined,
      status: client?.status || 0,
      password: client?.password || "",
      passwordConfirmation: client?.passwordConfirmation,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {

    try {
      if (client) {
        await Rest.client.put(`/api/Client/${client.id}`, { ...data, id: client.id });
      } else {
        await Rest.client.post("/api/Client", data);
      }

      toast({
        title: client ? "Atualizar Cliente" : "Cadastrar Cliente",
        description: client
          ? "Cliente atualizado com sucesso."
          : "Cliente cadastrado com sucesso.",
      });

      onClose();

    } catch (error) {
      toast({
        title: "Erro",
        description: client
          ? "Erro ao atualizar cliente."
          : "Erro ao cadastrar cliente.",
        variant: "destructive",
      });
      console.error("Error deleting client:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <FormField
            control={form.control}
            name="nomeRazaoSocial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-white">Nome/Razão Social</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome/Razão Social"
                    {...field}
                    className="text-zinc-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-row gap-x-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>
                    <span className="text-white">Email</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      {...field}
                      className="text-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>
                    <span className="text-white">Telefone</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Telefone"
                      {...field}
                      className="text-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <h2 className="text-white font-semibold">Informações Pessoais</h2>
          <div className="flex flex-row gap-x-5">
            <FormField
              control={form.control}
              name="cnpjCpf"
              render={({ field: { onChange, ...props } }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>
                    <span className="text-white">CPF/CNPJ</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CPF/CNPJ"
                      className="text-zinc-300"
                      onChange={(e) => {
                        const { value } = e.target;
                        e.target.value = formatCpfCnpj(value);
                        onChange(e);
                      }}
                      {...props}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoPessoa"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>
                    <span className="text-white">Tipo de Pessoa</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="text-zinc-300">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisica">Física</SelectItem>
                        <SelectItem value="juridica">Juridica</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-row gap-x-5">
            <FormField
              control={form.control}
              name="dataNascimento"
              disabled={form.watch("tipoPessoa") === "juridica"}
              render={({ field }) => (
                <FormItem
                  className={`flex flex-col ${form.watch("tipoPessoa") === "juridica" ? "hidden" : ""}`}
                >
                  <FormLabel>
                    <span className="text-white">Data de Nascimento</span>
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger
                        asChild
                        disabled={form.watch("tipoPessoa") === "juridica"}
                      >
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal text-zinc-300",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-white" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date > new Date() ||
                            date < new Date("1900-01-01") ||
                            form.watch("tipoPessoa") === "juridica"
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              disabled={form.watch("tipoPessoa") === "juridica"}
              render={({ field }) => (
                <FormItem
                  className={`flex flex-col w-full ${form.watch("tipoPessoa") === "juridica" ? "hidden" : ""}`}
                >
                  <FormLabel>
                    <span className="text-white">Gênero</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-zinc-300">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-row gap-x-5">
            <FormField
              control={form.control}
              disabled={
                form.watch("inscricaoEstadualIsento") === true ||
                form.watch("inscricaoEstadualPessoaFisica") === false
              }
              name="inscricaoEstadual"
              render={({ field }) => (
                <FormItem className="flex flex-col w-[300px]" >
                  <FormLabel>
                    <span className="text-white">Inscrição Estadual</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inscrição Estadual"
                      {...field}
                      onChange={(e) => {
                        const { value } = e.target;
                        e.target.value = formatInscricaoEstadual(value);
                        field.onChange(e);
                      }}
                      className="text-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled={form.watch("tipoPessoa") === "juridica"}
              name="inscricaoEstadualPessoaFisica"
              render={({ field }) => (
                <FormItem className={`flex flex-col ${form.watch("tipoPessoa") === "juridica" ? "hidden" : ""}`}>
                  <FormLabel>
                    <span className="text-white">
                      Pessoa Física com Inscrição Estadual?
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inscricaoEstadualIsento"
              disabled={form.watch("tipoPessoa") === "fisica"}
              render={({ field }) => (
                <FormItem className={`flex flex-col ${form.watch("tipoPessoa") === "fisica" ? "hidden" : ""}`}>
                  <FormLabel>
                    <span className="text-white">
                      Isento de Inscrição Estadual?
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <h2 className="text-white font-semibold">Situação do Cliente</h2>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col w-full">
                <FormLabel>
                  <span className="text-white">Status</span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue="active"
                  >
                    <SelectTrigger className="text-zinc-300">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <h2 className="text-white font-semibold">Senha de Acesso</h2>
          <FormField
            disabled={!!client}
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-white">Senha</span>
                </FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="text-zinc-300" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={!!client}
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <span className="text-white">Confirmar senha</span>
                </FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="text-zinc-300" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button variant="default" type="submit">Adicionar Cliente</Button>

      </form>
    </Form>
  );
}

const formatCpfCnpj = (value: string) => {
  const cleanedValue = value.replace(/\D/g, ""); // remove caracteres não numéricos

  if (cleanedValue.length <= 11) {
    // CPF
    return cleanedValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    // CNPJ
    return cleanedValue
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
};

const formatInscricaoEstadual = (value: string) => {
  const cleanedValue = value.replace(/\D/g, ""); // remove caracteres não numéricos

  // ###.###.###-###
  return cleanedValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}