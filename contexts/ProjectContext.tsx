"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Project {
  id: string;
  title: string;
  type: string;
  filmingStatus: string;
  fileLinks: string;
  notes: string;
  date: string;
  // Additional fields for tracking board
  editMode?: string;
  reviewMode?: string;
  designMode?: string;
  verificationMode?: string;
  reviewLinks?: string;
  designLinks?: string;
  documentation?: string;
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = (projectData: Omit<Project, "id">) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      editMode: "لم يبدأ",
      reviewMode: "في الانتظار",
      designMode: "في الانتظار",
      verificationMode: "لا شيء",
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    console.log("Updating project:", id, updates); // Debug log
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
