
import React, { useState } from 'react';
import { ExcelService, SheetData } from '@/services/excelService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardContainer from '@/components/dashboard/layout/DashboardContainer';

const ExcelDemo = () => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    try {
      setLoading(true);
      const file = e.target.files[0];
      const data = await ExcelService.readFile(file);
      setSheetData(data);
    } catch (error) {
      console.error("Error processing Excel file:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!sheetData) return;
    
    const exportData = [sheetData.headers, ...sheetData.rows];
    ExcelService.exportToExcel(exportData, 'exported-data.xlsx');
  };

  return (
    <DashboardContainer>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Excel Processing Demo</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange}
                disabled={loading}
              />
              <Button 
                onClick={handleExport} 
                disabled={!sheetData || loading}
              >
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && <p className="text-center py-4">Loading...</p>}

        {sheetData && (
          <Card>
            <CardHeader>
              <CardTitle>Sheet Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={sheetData.activeSheet}>
                <TabsList>
                  {sheetData.sheetNames.map(name => (
                    <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={sheetData.activeSheet}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {sheetData.headers.map((header, i) => (
                            <TableHead key={i}>{header || `Column ${i+1}`}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheetData.rows.slice(0, 10).map((row, i) => (
                          <TableRow key={i}>
                            {sheetData.headers.map((_, j) => (
                              <TableCell key={j}>{row[j] || ''}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {sheetData.rows.length > 10 && (
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Showing 10 of {sheetData.rows.length} rows
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardContainer>
  );
};

export default ExcelDemo;
