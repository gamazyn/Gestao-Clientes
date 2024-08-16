import { faker } from "@faker-js/faker";

export interface Client {
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
}

const generateFakeClient = () => {
	const client: Client = {
		nomeRazaoSocial: faker.person.lastName(),
		cnpjCpf: faker.number
			.int({ min: 10000000000, max: 99999999999 })
			.toString(),
		email: faker.internet.email(),
		tipoPessoa: faker.helpers.arrayElement(["fisica", "juridica"]),
		telefone: faker.number
			.int({ min: 10000000000, max: 99999999999 })
			.toString(),
		inscricaoEstadualIsento: faker.datatype.boolean(),
		dateCreated: new Date(),
		status: faker.helpers.arrayElement([0, 1]),
		password: "123456AFtASF",
		passwordConfirmation: "123456AFtASF",
	};

	if (!client.inscricaoEstadualIsento) {
		client.inscricaoEstadual = faker.number
			.int({ min: 10000000000, max: 99999999999 })
			.toString();
	}

	if (client.tipoPessoa === "fisica") {
		client.dataNascimento = faker.date.past();
		client.genero = faker.helpers.arrayElement([
			"masculino",
			"feminino",
			"outro",
		]);
	}

	return client;
};

// biome-ignore lint/suspicious/noExplicitAny: <yes>
const registerClient = async (client: any) => {
	try {
		console.log(client);
		const response = await fetch("http://localhost:5193/api/Client", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(client),
		});

		if (!response.ok) {
			console.error("Error registering client:", response.statusText);
			console.error("Response:", response);
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		console.log("Client registered successfully:", data);
	} catch (error) {
		console.error("Error registering client:", error);
	}
};

// Example usage
for (let i = 0; i < 10; i++) {
	const client = generateFakeClient();
	registerClient(client);
}
