interface Props {
  error?: boolean;
  onRetry?: () => void;
  className?: string;
}
export const ErrorPage = ({ error, onRetry, className }: Props) => {
  const getErrorMessage = () => {
    if (!error) return "An unknown error occurred";
    if (typeof error === "string") return error;
    // if (error?.message) return error.message;
    return JSON.stringify(error);
  };

  return (
    <div className={`error-component ${className || ""}`}>
      <div
        role="alert"
        style={{
          padding: "1rem",
          border: "1px solid #f5c6cb",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Error</h3>
        <p>{getErrorMessage()}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
