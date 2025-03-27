
const SupportedFormatsInfo = () => {
  return (
    <div className="text-xs text-muted-foreground mt-2">
      <p>Supported formats:</p>
      <ul className="list-disc list-inside ml-2">
        <li>CSV files from most Nigerian banks</li>
        <li>Excel files (.xlsx, .xls) with transaction data</li>
        <li>PDF files require server-side processing</li>
        <li>Files should include date, description, and amount columns</li>
        <li>Maximum file size: 10MB</li>
      </ul>
    </div>
  );
};

export default SupportedFormatsInfo;
