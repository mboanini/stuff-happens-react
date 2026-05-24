function FooterComponent() {
  return (
    <footer
      className="text-center py-0.5"
      style={{
        backgroundColor: "#4B0082",
        color: "#FFD700",
        fontSize: "0.80rem",
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <p className="mb-0">&copy; 2025 WA1</p>
    </footer>
  );
}

export default FooterComponent;
