import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePenLine } from "lucide-react";
import FormFull from "@/components/form";
import { Rest } from "@/services/client/rest.client";
import { useToast } from "@/components/ui/use-toast";
import type { Client } from "@/types/Client";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";


export default function Homepage() {
	const [data, setData] = React.useState<Client[]>([]);
	const [currentPage, setCurrentPage] = React.useState(1);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [visible, setVisible] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const handleClose = () => {
		setDialogOpen(false);
	}

	const handleEditClose = () => {
		setEditDialogOpen(false);
	}

	const fetchData = useCallback(async () => {
		try {
			const response = await Rest.client.get("/api/Client", {
				params: { page: currentPage, search: searchTerm },
			});
			setData(response.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	}, [currentPage, searchTerm]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const { toast } = useToast();

	const onFilterClick = () => {
		setVisible(!visible);
	};

	const querySearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const deleteClient = useCallback(
		async (client: Client) => {
			try {
				await Rest.client.delete(`/api/Client/${client.id}`);
				toast({
					title: "Excluir Cliente",
					description: "Cliente excluído com sucesso.",
				});
				fetchData();
			} catch (error) {
				toast({
					title: "Excluir Cliente",
					description: "Erro ao excluir cliente.",
					variant: "destructive",
				});
				console.error("Error deleting client:", error);
			}
		},
		[fetchData, toast],
	);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen h-full py-10 bg-background transition-all">
			<div className="grid grid-cols-[400px_1fr] justify-center items-center gap-x-10">
				<p className="text-4xl font-bold text-white text-start">
					Consulte os seus Clientes cadastrados na sua Loja ou realize o
					cadastro de novos Clientes
				</p>
				<div className="flex flex-col gap-y-4">
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild onClick={() => setDialogOpen(true)}>
							<Button variant="default">
								<span className="text-semibold text-white">
									Cadastrar Cliente
								</span>
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogDescription />
							<DialogHeader>
								<h2 className="text-2xl font-bold text-white">
									Cadastro de Cliente
								</h2>
							</DialogHeader>
							<div>
								<FormFull onClose={handleClose} />
							</div>
						</DialogContent>
					</Dialog>
					<Button variant="default" onClick={onFilterClick}>
						<span className="text-semibold text-white">Filtrar</span>
					</Button>
				</div>
			</div>

			<div
				className={`flex flex-col items-center justify-center gap-y-4 mt-10 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
			>
				<Card>
					<CardHeader className="px-7 flex flex-row justify-between items-center">
						<div className="flex flex-col space-y-1.5">
							<CardTitle>Clientes</CardTitle>
							<CardDescription>
								Veja seus clientes já cadastrados.
							</CardDescription>
						</div>
						<div className="flex w-full max-w-sm items-center space-x-2">
							<Input
								type="text"
								placeholder="Pesquisar"
								onChange={querySearch}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead role="checkbox">
										<Checkbox />
									</TableHead>
									<TableHead>Nome/Razão Social</TableHead>
									<TableHead className="hidden sm:table-cell">E-mail</TableHead>
									<TableHead className="hidden sm:table-cell">
										Telefone
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Data do Cadastro
									</TableHead>
									<TableHead className="hidden md:table-cell">
										Bloqueado
									</TableHead>
									<TableHead>Açôes</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((client) => (
									<TableRow key={client.id}>
										<TableCell role="checkbox">
											<div>
												<Checkbox />
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium">
												{client.nomeRazaoSocial}
											</div>
										</TableCell>
										<TableCell className="hidden sm:table-cell">
											{client.email}
										</TableCell>
										<TableCell className="hidden sm:table-cell">
											{client.telefone}
										</TableCell>
										<TableCell className="hidden md:table-cell">
											{client.dateCreated ? format(new Date(client.dateCreated), 'dd/MM/yyyy') : ''}
										</TableCell>
										<TableCell className="hidden sm:table-cell">
											<Badge
												className="text-xs"
												variant={client.status === 1 ? "secondary" : "default"}
											>
												{client.status === 1 ? "Bloqueado" : "Ativo"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
												<DropdownMenu>
													<DropdownMenuTrigger>
														<FilePenLine className="h-4 w-4" />
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuLabel>Ações</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DialogTrigger asChild>
															<DropdownMenuItem>Editar</DropdownMenuItem>
														</DialogTrigger>
														<DropdownMenuItem
															onClick={() => deleteClient(client)}
														>
															Excluir
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
												<DialogContent>
													<DialogTitle>Atualização de cliente</DialogTitle>
													<DialogDescription />
													<DialogHeader>
														<h2 className="text-2xl font-bold text-white">
															Edição de Cliente
														</h2>
													</DialogHeader>
													<div>
														<FormFull client={client} onClose={handleEditClose} />
													</div>
												</DialogContent>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										href="#"
										onClick={() => handlePageChange(currentPage - 1)}
									/>
								</PaginationItem>
								<PaginationItem>
									<PaginationLink href="#" onClick={() => handlePageChange(1)}>
										1
									</PaginationLink>
								</PaginationItem>
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
								<PaginationItem>
									<PaginationNext
										href="#"
										onClick={() => handlePageChange(currentPage + 1)}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
