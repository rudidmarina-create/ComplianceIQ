"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { WizardData } from "@/modules/company/schemas";

// ── Types ──────────────────────────────────────────────────────────

export type EditData = Partial<WizardData>;

interface WizardState {
  step: number;
  data: Partial<WizardData>;
  isEditMode: boolean;
}

type WizardAction =
  | { type: "SET_STEP"; step: number }
  | { type: "UPDATE_DATA"; data: Partial<WizardData> }
  | { type: "INIT_EDIT"; data: EditData }
  | { type: "RESET" };

const initialState: WizardState = {
  step: 1,
  data: {},
  isEditMode: false,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.data } };
    case "INIT_EDIT":
      return { ...state, data: { ...state.data, ...action.data }, isEditMode: true };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<WizardData>) => void;
  goToStep: (step: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useProfileWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useProfileWizard must be used within a ProfileWizardProvider");
  }
  return ctx;
}

interface ProfileWizardProviderProps {
  children: React.ReactNode;
  editData?: EditData;
}

export function ProfileWizardProvider({
  children,
  editData,
}: ProfileWizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Initialize with edit data if provided
  React.useEffect(() => {
    if (editData) {
      dispatch({ type: "INIT_EDIT", data: editData });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nextStep = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.min(state.step + 1, 4) });
  }, [state.step]);

  const prevStep = useCallback(() => {
    dispatch({ type: "SET_STEP", step: Math.max(state.step - 1, 1) });
  }, [state.step]);

  const updateData = useCallback((data: Partial<WizardData>) => {
    dispatch({ type: "UPDATE_DATA", data });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  return (
    <WizardContext.Provider
      value={{ state, dispatch, nextStep, prevStep, updateData, goToStep }}
    >
      {children}
    </WizardContext.Provider>
  );
}
