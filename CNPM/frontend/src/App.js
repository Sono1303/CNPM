
import React, { useState } from "react";
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import FeaturedBooks from "./components/FeaturedBooks";
import Categories from "./components/Categories";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import HistoryPage from "./components/HistoryPage";
import Footer from "./components/Footer";
import Services from "./components/Services";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage("home");
  };

  let pageContent;
  switch (currentPage) {
    case "home":
      pageContent = <HomePage currentUser={currentUser} />;
      break;
    case "featured":
      pageContent = <FeaturedBooks />;
      break;
    case "categories":
      pageContent = <Categories />;
      break;
    case "login":
      pageContent = <LoginPage onLogin={(user) => {
        setCurrentUser(user);
        setCurrentPage("home");
      }} />;
      break;
    case "admin":
      pageContent = <AdminDashboard />;
      break;
    case "history":
      pageContent = <HistoryPage currentUser={currentUser} />;
      break;
    case "services":
      pageContent = <Services />;
      break;
    default:
      pageContent = <HomePage currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Layout
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        {pageContent}
      </Layout>
      <Footer disabled={true} />
    </div>
  );
}

export default App;
