
import { useState } from "react";
import { ExcelUploader } from "@/components/common/ExcelUploader";
import { SheetData, ExcelService } from "@/services/excelService";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";

const ExcelDemo = () => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [columnTypes, setColumnTypes] = useState<Record<number, string>>({});
  
  const handleDataExtracted = (data: SheetData) => {
    setSheetData(data);
    // Detect column types
    setColumnTypes(ExcelService.detectColumnTypes(data));
  };

  const handleExport = () => {
    if (!sheetData) return;
    
    // Create a data array with headers and rows
    const exportData = [
      sheetData.headers,
      ...sheetData.rows
    ];
    
    // Export to Excel
    ExcelService.exportToExcel(exportData, "exported-data.xlsx");
  };

  return (
    <DashboardContainer>
      <header className="bg-white p-6 border-b">
        <h1 className="text-2xl font-bold">Excel Data Extraction</h1>
        <p className="text-gray-600 mt-1">Upload Excel files to extract and analyze data</p>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Upload Excel File</h2>
              <ExcelUploader
                onDataExtracted={handleDataExtracted}
                buttonText="Process Excel File"
                allowedExtensions={['.xlsx', '.xls', '.csv']}
                maxSize={15}
              />
            </div>

            {sheetData && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">File Information</h2>
                  <Button 
                    variant="outline"
                    onClick={handleExport}
                    className="flex gap-2 items-center"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Sheet Name</div>
                      <div className="font-medium">{sheetData.activeSheet}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Total Sheets</div>
                      <div className="font-medium">{sheetData.sheetNames.length}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Rows</div>
                      <div className="font-medium">{sheetData.rows.length}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Columns</div>
                      <div className="font-medium">{sheetData.headers.length}</div>
                    </div>
                  </div>
                  
                  {sheetData.sheetNames.length > 1 && (
                    <div>
                      <h3 className="font-medium mb-2">Available Sheets</h3>
                      <div className="flex flex-wrap gap-2">
                        {sheetData.sheetNames.map((name) => (
                          <div 
                            key={name}
                            className={`text-sm py-1 px-2 rounded-full ${name === sheetData.activeSheet ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {sheetData && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Extracted Data</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      {sheetData.headers.map((header, index) => (
                        <th 
                          key={index} 
                          className="px-4 py-2 border text-left text-sm font-medium"
                          title={`Type: ${columnTypes[index] || 'unknown'}`}
                        >
                          {header}
                          {columnTypes[index] && (
                            <span 
                              className={`ml-2 inline-block w-2 h-2 rounded-full ${
                                columnTypes[index] === 'date' ? 'bg-blue-500' : 
                                columnTypes[index] === 'number' ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheetData.rows.slice(0, 20).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 border text-sm">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {sheetData.rows.length > 20 && (
                  <div className="text-center text-sm text-gray-500 mt-4">
                    Showing first 20 rows of {sheetData.rows.length} total rows
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Date</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    <span>Text</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
};

export default ExcelDemo;
