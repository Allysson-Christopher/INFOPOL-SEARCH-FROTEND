import { PoliceReport } from "../types";

interface SearchResultsProps {
  results: PoliceReport[];
  isLoading: boolean;
}

const SearchResults = ({ results, isLoading }: SearchResultsProps) => {
  console.log("SearchResults component received:", {
    resultsLength: results.length,
    isLoading,
    firstResult: results.length > 0 ? JSON.stringify(results[0]) : "none",
  });

  if (isLoading) {
    console.log("SearchResults: Showing loading state");
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    console.log("SearchResults: No results found");
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Nenhum resultado encontrado.</p>
        <p className="text-gray-500 text-sm mt-2">
          Tente modificar os critérios de pesquisa.
        </p>
      </div>
    );
  }

  console.log("SearchResults: Rendering table with results:", results.length);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número B.O.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((report) => {
              console.log("Rendering report:", report.id);
              return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {report.boNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.reportDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <button
                      className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                      onClick={() => {
                        // Exibir o conteúdo completo do boletim
                        const fullContent = report.description || "";

                        // Criar um elemento de diálogo para melhor visualização
                        const dialog = document.createElement("dialog");
                        dialog.style.width = "80%";
                        dialog.style.maxWidth = "800px";
                        dialog.style.padding = "20px";
                        dialog.style.borderRadius = "8px";
                        dialog.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

                        // Adicionar o conteúdo do boletim
                        const content = document.createElement("div");

                        // Título
                        const title = document.createElement("h2");
                        title.textContent = `Boletim de Ocorrência: ${report.boNumber}`;
                        title.style.marginBottom = "16px";
                        title.style.fontSize = "18px";
                        title.style.fontWeight = "bold";

                        // Conteúdo principal
                        const textContent = document.createElement("pre");
                        textContent.textContent = fullContent;
                        textContent.style.whiteSpace = "pre-wrap";
                        textContent.style.fontFamily = "monospace";
                        textContent.style.fontSize = "14px";
                        textContent.style.backgroundColor = "#f5f5f5";
                        textContent.style.padding = "12px";
                        textContent.style.borderRadius = "4px";
                        textContent.style.maxHeight = "60vh";
                        textContent.style.overflow = "auto";

                        // Botão para fechar
                        const closeButton = document.createElement("button");
                        closeButton.textContent = "Fechar";
                        closeButton.style.marginTop = "16px";
                        closeButton.style.padding = "8px 16px";
                        closeButton.style.backgroundColor = "#4f46e5";
                        closeButton.style.color = "white";
                        closeButton.style.border = "none";
                        closeButton.style.borderRadius = "4px";
                        closeButton.style.cursor = "pointer";

                        closeButton.onclick = () => {
                          dialog.close();
                          document.body.removeChild(dialog);
                        };

                        // Montar o diálogo
                        content.appendChild(title);
                        content.appendChild(textContent);
                        content.appendChild(closeButton);
                        dialog.appendChild(content);

                        // Adicionar ao corpo e mostrar
                        document.body.appendChild(dialog);
                        dialog.showModal();
                      }}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchResults;
