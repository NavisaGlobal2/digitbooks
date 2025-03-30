
export const generateCSVTemplate = (): string => {
  const headers = ['Date', 'Description', 'Amount', 'Type'];
  const sampleRows = [
    ['2023-01-15', 'Supermarket purchase', '5000', 'debit'],
    ['2023-01-16', 'Salary payment', '150000', 'credit'],
    ['2023-01-18', 'Restaurant payment', '3500', 'debit'],
    ['2023-01-20', 'Electricity bill', '12000', 'debit'],
    ['2023-01-25', 'Fuel station', '8500', 'debit']
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'expense_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
