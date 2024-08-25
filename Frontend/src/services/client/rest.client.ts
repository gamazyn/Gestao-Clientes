import axios from "axios";
import type { AxiosInstance } from "axios";

class RestClient {
	public client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: "http://localhost:5050",
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.client.interceptors.response.use((response) => {
			`${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} - ${JSON.stringify(
				response.data,
				null,
				4,
			).substring(0, 1000)}`;

			return response;
		});
	}
}

export const Rest = new RestClient();
