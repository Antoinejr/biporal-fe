import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

function NotFound() {
  const navigator  = useNavigate();
  return (
    <div className="text-center p-5">
      <h1 className="font-bold"> 404 - Page Not Found</h1>
      <p>The page you are looking for does not exist. <br/> Nothing but crickets here</p>
      <Button variant="link" onClick={()=>navigator("/")}> Go Back Home </Button>
    </div>
  )
}

export default NotFound;
