import UpdateAdminPasswordForm from "@/features/UpdateAdminPasswordForm";
import { Card, CardHeader, CardTitle } from "./ui/card";

function PasswordCard() {
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-bold">Update Password</CardTitle>
          <UpdateAdminPasswordForm />
        </CardHeader>
      </Card>
    </div>
  );
}
export default PasswordCard;
