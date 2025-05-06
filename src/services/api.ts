import {
  SearchParams,
  SearchResponse,
  ApiSearchRequest,
  ApiSearchResponse,
  PoliceReport,
} from "../types";

// URL base da API
const API_BASE_URL = "http://52.90.58.180:8080/api";

// This is the real API service that connects to your backend server
export const apiService = {
  async searchReports(params: SearchParams): Promise<SearchResponse> {
    try {
      // Format the request body according to the server requirements
      const requestBody: ApiSearchRequest = {
        search_terms: [],
        search_columns: [],
        require_all_terms: false,
        show_details: true,
      };

      // Configurar o tipo de pesquisa com base nos parâmetros fornecidos
      if (params.boNumber) {
        // Pesquisa por número de BO
        requestBody.bulletin_number = params.boNumber;
      } else if (params.personName) {
        // Pesquisa por nome
        requestBody.search_terms = [params.personName];
      } else if (params.advancedTerms && params.advancedTerms.length > 0) {
        // Pesquisa avançada (termos alternativos ou cumulativos)
        requestBody.search_terms = params.advancedTerms.map(
          (term) => term.term
        );
        requestBody.require_all_terms = params.operator === "AND";
      } else if (params.searchTerms && params.searchTerms.length > 0) {
        // Pesquisa com múltiplos termos
        requestBody.search_terms = params.searchTerms;
        requestBody.require_all_terms = params.requireAllTerms || false;
      }

      // Aplicar filtros de data se fornecidos
      if (params.startDate || params.endDate) {
        requestBody.date_filter = {
          start_date: params.startDate,
          end_date: params.endDate,
        };
      }

      console.log("API Request:", JSON.stringify(requestBody));

      // Make the API call
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const apiResponse: ApiSearchResponse = await response.json();
      console.log("Raw API Response:", JSON.stringify(apiResponse, null, 2));

      if (apiResponse.error) {
        throw new Error(`API returned an error: ${apiResponse.error}`);
      }

      // Transform the server response to match our application's expected format
      const policeReports: PoliceReport[] = [];

      // Process details if they exist
      if (apiResponse.details && Array.isArray(apiResponse.details)) {
        apiResponse.details.forEach(
          (item: { bo_number: string; details: string[] }, index: number) => {
            // Create a report for each BO number
            if (item.bo_number) {
              let description = "";
              let complemento = "";

              // O primeiro item é sempre o conteúdo principal
              if (Array.isArray(item.details) && item.details.length > 0) {
                description = item.details[0];
              }

              // Para pesquisas por nome ou termos, o segundo item (se existir) é o complemento
              if (Array.isArray(item.details) && item.details.length > 1) {
                complemento = item.details[1];
              }

              // Se houver texto_completo disponível, usar ele como descrição principal
              if (apiResponse.texto_completo) {
                description = apiResponse.texto_completo;
              }

              const report: PoliceReport = {
                id: `report_${index}`,
                boNumber: item.bo_number,
                reportDate: new Date().toISOString().split("T")[0], // Placeholder
                city: "Não especificado",
                crimeType: "Não especificado",
                description: description,
                complemento: complemento,
                persons: [
                  {
                    name: params.personName || "Não especificado",
                    role: "Mencionado",
                  },
                ],
              };
              policeReports.push(report);
            }
          }
        );
      }

      console.log(
        "Transformed Police Reports:",
        JSON.stringify(policeReports, null, 2)
      );

      const searchResponse = {
        results: policeReports,
        totalCount: apiResponse.total_matches || 0,
        page: 1,
        pageSize: 10,
      };

      console.log(
        "Final Search Response:",
        JSON.stringify(searchResponse, null, 2)
      );

      return searchResponse;
    } catch (error) {
      console.error("Error calling search API:", error);
      throw error;
    }
  },

  async searchByBulletinNumber(boNumber: string): Promise<{
    boDetails: string | null;
    isLoading: boolean;
    error: string | null;
  }> {
    try {
      // Format the request body according to the server requirements
      const requestBody = {
        search_terms: [],
        search_columns: [],
        require_all_terms: false,
        show_details: true,
        bulletin_number: boNumber,
      };

      console.log("BO Search API Request:", JSON.stringify(requestBody));

      // Make the API call
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log(
        "BO Search API Response:",
        JSON.stringify(apiResponse, null, 2)
      );

      if (apiResponse.error) {
        throw new Error(`API returned an error: ${apiResponse.error}`);
      }

      // Extract the full text of the police report
      let boDetails = null;

      // Se a API retornar o texto_completo, use-o
      if (apiResponse.texto_completo) {
        boDetails = apiResponse.texto_completo;
      }
      // Caso contrário, tente extrair dos detalhes como antes
      else if (
        apiResponse.details &&
        Array.isArray(apiResponse.details) &&
        apiResponse.details.length > 0 &&
        apiResponse.details[0].details &&
        Array.isArray(apiResponse.details[0].details) &&
        apiResponse.details[0].details.length > 0
      ) {
        boDetails = apiResponse.details[0].details[0];
      } else {
        return {
          boDetails: null,
          isLoading: false,
          error: "Boletim de ocorrência não encontrado",
        };
      }

      return { boDetails, isLoading: false, error: null };
    } catch (error) {
      console.error("Error searching for bulletin number:", error);
      return {
        boDetails: null,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar o boletim",
      };
    }
  },

  // Verificar status da API
  async checkApiHealth(): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`API health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao verificar status da API:", error);
      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao verificar status da API",
      };
    }
  },
};

// Mock API service for testing and development
export const mockApiService = {
  async searchReports(_params: SearchParams): Promise<SearchResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock response for testing
    return {
      results: [
        {
          id: "1",
          boNumber: "BO123456",
          reportDate: "2023-10-15",
          city: "São Paulo",
          crimeType: "Furto",
          description: "Furto de celular na região central",
          complemento: "Informações adicionais sobre o caso",
          persons: [
            { name: "João Silva", role: "Vítima" },
            { name: "Desconhecido", role: "Suspeito" },
          ],
        },
        {
          id: "2",
          boNumber: "BO789012",
          reportDate: "2023-11-20",
          city: "Rio de Janeiro",
          crimeType: "Roubo",
          description: "Roubo de veículo na zona sul",
          complemento: "Detalhes complementares do caso",
          persons: [
            { name: "Maria Santos", role: "Vítima" },
            { name: "Carlos Oliveira", role: "Suspeito" },
          ],
        },
      ],
      totalCount: 2,
      page: 1,
      pageSize: 10,
    };
  },

  async searchByBulletinNumber(boNumber: string): Promise<{
    boDetails: string | null;
    isLoading: boolean;
    error: string | null;
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response for testing
    if (boNumber === "123456") {
      return {
        boDetails:
          "BOLETIM DE OCORRÊNCIA Nº 123456\nData: 2023-12-15\nLocal: São Paulo\nNatureza: Furto\nDescrição: Relato detalhado do incidente ocorrido conforme declaração da vítima...",
        isLoading: false,
        error: null,
      };
    } else {
      return {
        boDetails: null,
        isLoading: false,
        error: "Boletim de ocorrência não encontrado",
      };
    }
  },

  // Mock para verificar status da API
  async checkApiHealth(): Promise<{ status: string; message?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock response
    return {
      status: "healthy",
      message: "API está funcionando normalmente",
    };
  },
};
