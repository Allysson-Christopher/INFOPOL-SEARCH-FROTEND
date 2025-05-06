export type SearchOperator = "AND" | "OR";

export interface AdvancedSearchTerm {
  term: string;
  id: string;
}

export interface SearchParams {
  boNumber?: string;
  personName?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  crimeType?: string;
  advancedTerms?: AdvancedSearchTerm[];
  operator?: SearchOperator;
  requireAllTerms?: boolean;
  searchTerms?: string[];
}

export interface PoliceReport {
  id: string;
  boNumber: string;
  reportDate: string;
  city: string;
  crimeType: string;
  description: string;
  complemento?: string;
  persons: {
    name: string;
    role: string;
  }[];
}

export interface SearchResponse {
  results: PoliceReport[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// API specific types for the external server
export interface ApiSearchRequest {
  search_terms: string[];
  search_columns: string[];
  require_all_terms: boolean;
  show_details: boolean;
  bulletin_number?: string;
  start_date?: string;
  end_date?: string;
  date_filter?: {
    start_date?: string;
    end_date?: string;
  };
}

export interface ApiSearchResult {
  // Define the structure based on the actual API response
  id?: string;
  file_path?: string;
  content?: string;
  score?: number;
  matches?: string[];
  details?: Record<string, any>;
}

export interface ApiSearchResponse {
  total_matches?: number;
  bo_numbers?: string[];
  details?: Array<{
    bo_number: string;
    details: string[];
  }>;
  error?: string;
  texto_completo?: string;
}
