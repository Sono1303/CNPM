import React, { useState } from "react";
import { loginUser, registerUser } from "../utils/apiClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function LoginPage({ onLogin }) {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ user_name: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [success, setSuccess] = useState("");
  const [tabValue, setTabValue] = useState("login");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    setSuccess("");
    // client-side validation
    const usernameOk = validateUsername(loginData.username);
    const passwordOk = validatePassword(loginData.password);
    if (!usernameOk.valid) {
      setLoginError(usernameOk.message);
      setLoading(false);
      return;
    }
    if (!passwordOk.valid) {
      setLoginError(passwordOk.message);
      setLoading(false);
      return;
    }
    try {
      const res = await loginUser({ user_name: loginData.username, password: loginData.password });
      if (res && res.token) {
        // persist token for API calls
        try { localStorage.setItem('token', res.token); } catch (e) {}
        setSuccess("Login successful!");
        if (onLogin) onLogin(res.user || { username: loginData.username });
      } else {
        setLoginError(res?.message || "Invalid username or password");
      }
    } catch (error) {
      // apiClient throws Error('API 400 ...: <body>'), try to extract JSON body message
      let msg = error?.message || "Server connection error";
      try {
        const jsonPart = msg.substring(msg.indexOf('{'));
        const parsed = JSON.parse(jsonPart);
        if (parsed && parsed.message) msg = parsed.message;
      } catch (e) {
        // ignore parsing errors
      }
      setLoginError(msg);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  setLoading(true);
  setRegisterError("");
  setSuccess("");
    // Client-side confirm password validation
    // validate username/password first
    const usernameOk = validateUsername(registerData.user_name);
    const passwordOk = validatePassword(registerData.password);
    if (!usernameOk.valid) {
      setRegisterError(usernameOk.message);
      setLoading(false);
      return;
    }
    if (!passwordOk.valid) {
      setRegisterError(passwordOk.message);
      setLoading(false);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await registerUser({ user_name: registerData.user_name, password: registerData.password });
        // treat different success shapes from API: { success: true } or { message: 'Register success' } or status 201
        const isSuccess = res && (res.success || (typeof res.message === 'string' && /success/i.test(res.message)) || res.status === 201);
        if (isSuccess) {
          setSuccess("Registration successful!");
          setRegisterError("");
          // switch to login tab so user can sign in
          setTabValue("login");
          // programmatic fallback in case controlled Tabs didn't update UI
          setTimeout(() => {
            try { document.getElementById('login-tab-trigger')?.click(); } catch (e) {}
          }, 50);
          // prefill username in login form and clear any password/login errors
          setLoginData({ username: registerData.user_name, password: "" });
          setLoginError("");
        } else {
          setRegisterError(res?.message || "Registration failed");
        }
    } catch (error) {
      let msg = error?.message || "Server connection error";
      try {
        const jsonPart = msg.substring(msg.indexOf('{'));
        const parsed = JSON.parse(jsonPart);
        if (parsed && parsed.message) msg = parsed.message;
      } catch (e) {}
      setRegisterError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">Welcome to LIBA</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 flex flex-col">
          <Tabs value={tabValue} onValueChange={setTabValue} defaultValue="login" className="w-full flex-1">
            <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" id="login-tab-trigger">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
            <TabsContent value="login" className="flex-1">
              <form onSubmit={handleLogin} className="flex flex-col space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={loginData.username}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLoginData({ ...loginData, username: v });
                      const vOk = validateUsername(v);
                      setLoginError(vOk.valid ? "" : vOk.message);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLoginData({ ...loginData, password: v });
                      // clear any registration success message when user starts typing to log in
                      setSuccess("");
                      const pOk = validatePassword(v);
                      setLoginError(pOk.valid ? "" : pOk.message);
                    }}
                    required
                  />
                </div>
                <div className="mt-auto">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
      </form>
    {loginError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">{loginError}</div>}
    {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}
            </TabsContent>
            <TabsContent value="register" className="flex-1">
              <form onSubmit={handleRegister} className="flex flex-col space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Enter username"
                    value={registerData.user_name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRegisterData({ ...registerData, user_name: v });
                      const vOk = validateUsername(v);
                      setRegisterError(vOk.valid ? "" : vOk.message);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Enter password"
                    value={registerData.password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRegisterData({ ...registerData, password: v });
                      const pOk = validatePassword(v);
                      // if confirm present, also check match
                      if (!pOk.valid) setRegisterError(pOk.message);
                      else if (registerData.confirmPassword && registerData.confirmPassword !== v) setRegisterError('Passwords do not match');
                      else setRegisterError("");
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirm Password</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="Confirm password"
                    value={registerData.confirmPassword}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRegisterData({ ...registerData, confirmPassword: v });
                      if (registerData.password && registerData.password !== v) setRegisterError('Passwords do not match');
                      else setRegisterError("");
                    }}
                  />
                </div>
                <div className="mt-auto">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
        {registerError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">{registerError}</div>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Validation helpers (default standards)
function validateUsername(v) {
  if (!v || typeof v !== 'string') return { valid: false, message: 'Username is required' };
  const trimmed = v.trim();
  if (trimmed.length < 3) return { valid: false, message: 'Username must be at least 3 characters' };
  if (trimmed.length > 30) return { valid: false, message: 'Username must be at most 30 characters' };
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) return { valid: false, message: 'Username may only contain letters, numbers and _' };
  return { valid: true };
}

function validatePassword(v) {
  if (!v || typeof v !== 'string') return { valid: false, message: 'Password is required' };
  if (v.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  return { valid: true };
}
