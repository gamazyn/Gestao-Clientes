export interface Client {
	id: number;
	nomeRazaoSocial: string;
	cnpjCpf: string;
	email: string;
	tipoPessoa: "fisica" | "juridica";
	telefone: string;
	inscricaoEstadual?: string;
	inscricaoEstadualIsento: boolean;
	genero?: "masculino" | "feminino" | "outro";
	dataNascimento?: Date | string;
	dateCreated: Date;
	status: 0 | 1;
	password: string;
	passwordConfirmation: string;
	passwordHash: string;
}
