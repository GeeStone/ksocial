// === src/components/auth/AuthField.jsx ===
// Универсальное поле формы (лейбл + инпут + ошибка)

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthField = ({ label, type, reg, error }) => {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input type={type} placeholder={label} {...reg} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default AuthField;
