import { useState } from "react";
import { useDisclosure } from "./useDisclosure";

interface UseModalStateProps {
  initialTitle?: string;
  initialBody?: string;
  initialOkText?: string;
  initialCancelText?: string;
}

export function useModalState({
  initialTitle = "",
  initialBody = "",
  initialOkText = "Ok",
  initialCancelText = "Avbryt",
}: UseModalStateProps = {}) {
  const modal = useDisclosure();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [okText, setOkText] = useState(initialOkText);
  const [cancelText, setCancelText] = useState(initialCancelText);
  const [cancelDisabled, setCancelDisabled] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const resetModal = () => {
    setTitle(initialTitle);
    setBody(initialBody);
    setOkText(initialOkText);
    setCancelText(initialCancelText);
    setCancelDisabled(false);
    setIsConfirmDelete(false);
  };

  return {
    modal,
    title,
    setTitle,
    body,
    setBody,
    okText,
    setOkText,
    cancelText,
    setCancelText,
    cancelDisabled,
    setCancelDisabled,
    isConfirmDelete,
    setIsConfirmDelete,
    resetModal,
  };
}
