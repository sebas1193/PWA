function Loader() {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div className="spinner"></div>

      <style>
        {`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #ccc;
            border-top: 4px solid #333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: auto;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Loader;