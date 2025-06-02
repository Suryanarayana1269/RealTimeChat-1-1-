import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AnimatedGradientBg from './components/AnimatedGradientBg.jsx'; // Add this import
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import ChatWindow from './components/Chat/ChatWindow.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <AnimatedGradientBg /> {/* Add this line for dynamic gradient background */}
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatWindow />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;