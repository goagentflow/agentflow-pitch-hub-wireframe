import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Placeholder for Microsoft sign-in - navigate to hubs page
    console.log("Sign in button clicked (placeholder)");
    navigate("/hubs");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient background elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-gradient-blue/20 via-gradient-purple/20 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gradient-purple/20 via-gradient-blue/10 to-transparent rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md relative z-10 p-8 md:p-12 shadow-xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src="https://www.goagentflow.com/assets/images/AgentFlowLogo.svg" 
              alt="AgentFlow Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Welcome Content */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-royal-blue">
              Welcome to your AgentFlow Hub
            </h1>
            <p className="text-medium-grey text-base md:text-lg">
              Sign in to access your proposal and collaborate with us
            </p>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleSignIn}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-gradient-blue to-gradient-blue/90 hover:from-gradient-blue/90 hover:to-gradient-blue/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <svg 
                className="w-6 h-6 mr-3" 
                viewBox="0 0 23 23" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 0H0V11H11V0Z" fill="#F25022"/>
                <path d="M23 0H12V11H23V0Z" fill="#7FBA00"/>
                <path d="M11 12H0V23H11V12Z" fill="#00A4EF"/>
                <path d="M23 12H12V23H23V12Z" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
            </Button>

            {/* Decorative divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gradient-purple/20"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-sm text-medium-grey">
              © 2025 AgentFlow. All rights reserved.
            </p>
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
