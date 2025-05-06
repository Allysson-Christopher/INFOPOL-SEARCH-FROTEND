import { useState } from "react";
import { z } from "zod";
import { SearchParams, PoliceReport } from "../types";
import { advancedSearchSchema } from "../schemas/search";
import { apiService } from "../services/api";
import SearchResults from "./SearchResults";
import Header from "./Header";
import ApiErrorBanner from "./ApiErrorBanner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";

const SearchPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PoliceReport[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<z.infer<typeof advancedSearchSchema>>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: {
      advancedTerms: [{ term: "", id: uuidv4() }],
      operator: "AND",
      startDate: "",
      endDate: "",
      boNumber: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "advancedTerms",
  });

  const advancedTerms = watch("advancedTerms");
  const hasMultipleTerms =
    advancedTerms.filter((term) => term.term.trim() !== "").length > 1;
  const boNumber = watch("boNumber");

  const hasValidSearch =
    advancedTerms.some((term) => term.term.trim() !== "") ||
    (boNumber && boNumber.trim() !== "");

  const addSearchTerm = () => {
    append({ term: "", id: uuidv4() });
  };

  // Pré-processamento do formulário antes de enviar
  const onSubmit = (data: z.infer<typeof advancedSearchSchema>) => {
    // Se tiver boNumber preenchido mas nenhum termo de pesquisa, adicionar um placeholder
    if (
      data.boNumber &&
      data.boNumber.trim() !== "" &&
      !data.advancedTerms.some((term) => term.term.trim() !== "")
    ) {
      // Adicionamos um espaço temporário no primeiro campo de termo
      // Isso é apenas para passar na validação e será filtrado na busca
      setValue("advancedTerms.0.term", " ");

      // Obter os valores atualizados
      const updatedData = getValues();

      // Chamar a pesquisa com os dados atualizados
      handleSearch(updatedData);

      // Limpar o campo de termo após a pesquisa para não confundir o usuário
      setTimeout(() => {
        setValue("advancedTerms.0.term", "");
      }, 100);
    } else {
      // Caso contrário, proceder normalmente
      handleSearch(data);
    }
  };

  const handleSearch = async (data: z.infer<typeof advancedSearchSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar qual tipo de pesquisa deve ser realizada
      if (data.boNumber && data.boNumber.trim() !== "") {
        // Pesquisa por número de BO
        console.log("Searching by BO number:", data.boNumber);
        const response = await apiService.searchReports({
          boNumber: data.boNumber,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        setResults(response.results);
        setSearchPerformed(true);
      } else {
        // Pesquisa por termos avançados
        const validTerms = data.advancedTerms.filter(
          (term) => term.term.trim() !== ""
        );

        if (validTerms.length === 0) {
          setError(
            "Por favor, adicione pelo menos um termo de pesquisa válido ou um número de BO."
          );
          setIsLoading(false);
          return;
        }

        // Preparar parâmetros para a API
        const searchParams: SearchParams = {
          advancedTerms: validTerms,
          operator: data.operator,
          startDate: data.startDate,
          endDate: data.endDate,
        };

        console.log("Search params:", searchParams);
        const response = await apiService.searchReports(searchParams);
        console.log("Search response:", JSON.stringify(response, null, 2));

        setResults(response.results);
        setSearchPerformed(true);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setError("Erro ao realizar a pesquisa. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-8">
            <ApiErrorBanner message={error} onDismiss={() => setError(null)} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                Pesquise por termos ou número de BO. Você pode adicionar
                múltiplos termos e escolher como combiná-los.
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Termos de Pesquisa
                </label>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <input
                      type="text"
                      {...register(`advancedTerms.${index}.term`)}
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Digite um termo de pesquisa"
                    />
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                      disabled={fields.length <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSearchTerm}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Adicionar Termo
                </button>

                {errors.advancedTerms && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.advancedTerms.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operador de Pesquisa
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="operator-and"
                      value="AND"
                      {...register("operator")}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      disabled={!hasMultipleTerms}
                    />
                    <label
                      htmlFor="operator-and"
                      className={`ml-2 text-sm ${
                        hasMultipleTerms ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      Todos os termos
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="operator-or"
                      value="OR"
                      {...register("operator")}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      disabled={!hasMultipleTerms}
                    />
                    <label
                      htmlFor="operator-or"
                      className={`ml-2 text-sm ${
                        hasMultipleTerms ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      Qualquer termo
                    </label>
                  </div>
                </div>
                {errors.operator && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.operator.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="boNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número do Boletim de Ocorrência
                </label>
                <input
                  type="text"
                  id="boNumber"
                  {...register("boNumber")}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Digite o número do BO"
                />
                {errors.boNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.boNumber.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    {...register("startDate")}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Data Final
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    {...register("endDate")}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow-sm transition-colors"
                  disabled={isLoading || !hasValidSearch}
                >
                  {isLoading ? "Pesquisando..." : "Pesquisar"}
                </button>
              </div>
            </form>
          </div>

          {searchPerformed && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">
                Resultados da Pesquisa{" "}
                {results.length > 0 ? `(${results.length})` : ""}
              </h2>
              <SearchResults results={results} isLoading={isLoading} />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} InfoPol Search. Todos os direitos
          reservados.
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
