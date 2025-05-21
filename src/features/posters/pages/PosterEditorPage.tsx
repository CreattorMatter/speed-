import { HeaderProvider } from "@/components/shared/HeaderProvider";
import React from "react";
import { Header } from "@/components/shared/Header";

const PosterEditorPage: React.FC = () => {
  return (
    <HeaderProvider userEmail="" userName="">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Hola mundo</h1>
      </div>
    </HeaderProvider>
  );
};

export default PosterEditorPage;
