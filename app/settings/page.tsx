"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Settings as SettingsIcon, Shield, Key, Server, Cpu, HelpCircle, Save, Check, BookOpen, ArrowRight } from "lucide-react";
import { useAISettings, AIProvider } from "@/lib/store/ai-settings";
import { useToast } from "@/components/ui/ToastQueue";

const PROVIDER_DEFAULTS: Record<AIProvider, { model: string, baseUrl: string }> = {
  openai: { model: "gpt-4o-mini", baseUrl: "" },
  anthropic: { model: "claude-3-haiku-20240307", baseUrl: "" },
  gemini: { model: "gemini-1.5-flash", baseUrl: "" },
  deepseek: { model: "deepseek-chat", baseUrl: "" },
  mistral: { model: "mistral-large-latest", baseUrl: "" },
  groq: { model: "llama3-8b-8192", baseUrl: "" },
  cohere: { model: "command-r", baseUrl: "" },
  perplexity: { model: "llama-3-sonar-large-32k-chat", baseUrl: "" },
  openrouter: { model: "openrouter/auto", baseUrl: "" },
  ollama: { model: "gemma:2b", baseUrl: "http://localhost:11434" },
  lmstudio: { model: "local-model", baseUrl: "http://localhost:1234" },
};

// Dictionary of known valid models. 
// If a user types something not in this array (for strict providers), we fallback to default.
const VALID_MODELS: Partial<Record<AIProvider, string[]>> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1-preview", "o1-mini"],
  anthropic: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307", "claude-3-sonnet-20240229"],
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
  deepseek: ["deepseek-chat", "deepseek-coder"],
  mistral: ["mistral-large-latest", "mistral-small-latest", "open-mixtral-8x22b", "open-mistral-nemo"],
  groq: ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma-7b-it"],
  cohere: ["command-r", "command-r-plus"],
  perplexity: [
    "llama-3-sonar-small-32k-chat", "llama-3-sonar-large-32k-chat", "llama-3-sonar-small-32k-online", "llama-3-sonar-large-32k-online",
    "gpt4o", "gpt41", "gpt55", "gpt55_thinking", "claude46sonnet", "claude48opus", "gemini35flash"
  ]
};

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const store = useAISettings();
  const toast = useToast();
  const [saved, setSaved] = useState(false);

  // Local state for the form
  const [userName, setUserName] = useState("");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserName(store.userName);
    setProvider(store.provider);
    setApiKey(store.apiKey);
    setModel(store.model);
    setBaseUrl(store.baseUrl);
  }, [store]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    setModel(PROVIDER_DEFAULTS[newProvider].model);
    setBaseUrl(PROVIDER_DEFAULTS[newProvider].baseUrl);
  };

  const validateModelOnBlur = () => {
    const validModelsForProvider = VALID_MODELS[provider];
    if (validModelsForProvider) {
      if (!validModelsForProvider.includes(model.trim())) {
        toast.error(`"${model}" is not a recognized model for ${provider}. Reverting to default.`);
        setModel(PROVIDER_DEFAULTS[provider].model);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.setUserName(userName);
    store.setProvider(provider);
    store.setApiKey(apiKey);
    store.setModel(model);
    store.setBaseUrl(baseUrl);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  const requiresApiKey = provider !== "ollama";
  const requiresBaseUrl = provider === "ollama" || provider === "lmstudio";

  const renderGuideContent = () => {
    switch (provider) {
      case "gemini":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Google Gemini AI Studio Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
              <li>Sign in with your Google account.</li>
              <li>In the left sidebar, click on <strong>Get API Key</strong>.</li>
              <li>Click the <strong>Create API Key</strong> button, and choose to create it in a new project.</li>
              <li>Copy the generated key and paste it into the API Key field in the settings.</li>
            </ol>
            <p className="bg-secondary/30 p-3 rounded-xl border border-border"><strong>Tip:</strong> Gemini 1.5 Flash is extremely fast and includes a generous free daily tier, making it the perfect default!</p>
          </div>
        );
      case "openai":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">OpenAI Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenAI Platform</a>.</li>
              <li>Sign in or create an account.</li>
              <li>In the sidebar, navigate to <strong>Settings</strong> {'>'} <strong>Billing</strong> and ensure you have added a payment method or have pre-paid credits.</li>
              <li>Navigate to <strong>API Keys</strong> in the sidebar.</li>
              <li>Click <strong>Create new secret key</strong>. Copy the key immediately, as you won&apos;t be able to view it again.</li>
              <li>Paste the key into the API Key field in settings.</li>
            </ol>
          </div>
        );
      case "anthropic":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Anthropic (Claude) Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Anthropic Console</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Ensure you have added credits to your account under the Billing section.</li>
              <li>Navigate to <strong>Settings</strong> {'>'} <strong>API Keys</strong>.</li>
              <li>Click <strong>Create Key</strong>. Copy the key.</li>
              <li>Paste the key into the API Key field in settings.</li>
            </ol>
          </div>
        );
      case "deepseek":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">DeepSeek Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">DeepSeek Platform</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Go to the <strong>Top up</strong> section to add a small amount of credits.</li>
              <li>Navigate to the <strong>API Keys</strong> tab.</li>
              <li>Click <strong>Create new API key</strong>, copy it, and paste it into the settings.</li>
            </ol>
          </div>
        );
      case "mistral":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Mistral AI Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Mistral Console</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Navigate to the <strong>Billing</strong> section and add a payment method.</li>
              <li>Navigate to <strong>API Keys</strong>.</li>
              <li>Click <strong>Create new key</strong>, copy it, and paste it into the settings.</li>
            </ol>
          </div>
        );
      case "groq":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Groq Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Groq Console</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Click <strong>Create API Key</strong> in the API Keys section.</li>
              <li>Copy the generated key and paste it into the settings.</li>
            </ol>
            <p className="bg-secondary/30 p-3 rounded-xl border border-border"><strong>Tip:</strong> Groq uses custom LPUs to generate tokens at breakneck speeds, making it excellent for instant completions.</p>
          </div>
        );
      case "cohere":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Cohere Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://dashboard.cohere.com/api-keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">Cohere Dashboard</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Scroll down to <strong>API Keys</strong>. You can use the free Trial key or generate a Production key.</li>
              <li>Copy the key and paste it into the settings.</li>
            </ol>
          </div>
        );
      case "perplexity":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Perplexity Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to the <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noreferrer" className="text-primary hover:underline">Perplexity Settings</a>.</li>
              <li>Sign in to your Pro account.</li>
              <li>Ensure your account has API credits available.</li>
              <li>Generate a new API Key, copy it, and paste it into the settings.</li>
            </ol>
          </div>
        );
      case "openrouter":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">OpenRouter Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Navigate to <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenRouter</a>.</li>
              <li>Sign in or create an account.</li>
              <li>Click <strong>Create Key</strong>.</li>
              <li>Copy the key and paste it into the settings. You can use the default `openrouter/auto` model or specify any exact model name OpenRouter supports.</li>
            </ol>
          </div>
        );
      case "ollama":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">Ollama (Local AI) Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download and install <a href="https://ollama.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Ollama</a> for your operating system.</li>
              <li>Open your computer&apos;s terminal or command prompt.</li>
              <li>Run a command to download and start a model. For example, if you have 8GB-16GB of RAM, try a small model: <code className="bg-background px-1 py-0.5 rounded text-primary border border-border">ollama run gemma:2b</code> or <code className="bg-background px-1 py-0.5 rounded text-primary border border-border">ollama run phi3</code>.</li>
              <li>Wait for the download to finish. Once it says &quot;success&quot;, the model is ready.</li>
              <li>Keep the terminal open or ensure the Ollama app is running in your system tray.</li>
              <li>Ensure the Base URL in settings is exactly <code>http://localhost:11434</code>.</li>
            </ol>
            <p className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl border border-emerald-500/20 font-medium"><strong>Advantage:</strong> Ollama runs entirely locally, meaning it is 100% free and private. No data is sent to the cloud.</p>
          </div>
        );
      case "lmstudio":
        return (
          <div className="space-y-4 text-sm text-muted-foreground">
            <h4 className="font-bold text-foreground">LM Studio (Local AI) Setup</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download and install <a href="https://lmstudio.ai/" target="_blank" rel="noreferrer" className="text-primary hover:underline">LM Studio</a>.</li>
              <li>Open LM Studio and search for a model in the search bar (e.g. <code>Meta-Llama-3-8B-Instruct</code>).</li>
              <li>Download a <strong>Q4_K_M</strong> GGUF file (this is a good balance of quality and low RAM usage).</li>
              <li>Go to the <strong>Local Server</strong> tab (the ↔️ icon on the left).</li>
              <li>Select the model you just downloaded from the top dropdown.</li>
              <li>Click <strong>Start Server</strong>.</li>
              <li>Ensure the Base URL in settings is exactly <code>http://localhost:1234/v1</code>.</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:pl-64">
      <Navbar />
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-foreground tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your AI integration and personalization settings. Keys are saved securely in your browser and never sent to our database.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" /> Personalization
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Your Name (Optional)</label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  If provided, the AI will use your name to make generation results more personal.
                </p>
              </div>
            </div>
          </div>

          {/* AI Provider Settings */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" /> AI Provider Configuration
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowGuideModal(true)} className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Comprehensive Guide
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-1.5">Select AI Provider</label>
                <Select
                  value={provider}
                  onChange={(val: any) => handleProviderChange(val)}
                  options={[
                    { value: "gemini", label: "Google Gemini AI Studio (Recommended / Free Tier)" },
                    { value: "openai", label: "OpenAI (ChatGPT)" },
                    { value: "anthropic", label: "Anthropic (Claude)" },
                    { value: "deepseek", label: "DeepSeek" },
                    { value: "mistral", label: "Mistral AI" },
                    { value: "groq", label: "Groq (High Speed)" },
                    { value: "cohere", label: "Cohere" },
                    { value: "perplexity", label: "Perplexity" },
                    { value: "openrouter", label: "OpenRouter" },
                    { value: "ollama", label: "Ollama (Local AI)" },
                    { value: "lmstudio", label: "LM Studio (Local AI)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requiresApiKey && (
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Key className="w-4 h-4" /> API Key
                    </label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter your ${provider} API Key`}
                      required={requiresApiKey}
                    />
                  </div>
                )}

                {requiresBaseUrl && (
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Server className="w-4 h-4" /> Base URL
                    </label>
                    <Input
                      type="url"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="e.g. http://localhost:11434"
                      required={requiresBaseUrl}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1.5">Model Name</label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    onBlur={validateModelOnBlur}
                    placeholder="e.g. gpt-4o"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">If an invalid model is entered, it will auto-correct to the default.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Free Tier Callout (Show only if cloud paid provider is selected) */}
          {["openai", "anthropic", "deepseek", "mistral", "groq", "cohere", "perplexity", "openrouter"].includes(provider) && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 shadow-sm text-emerald-700 dark:text-emerald-400">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                💰 Don&apos;t want to pay for API usage?
              </h3>
              <p className="text-sm font-medium">
                Try switching the provider to <strong>Google Gemini AI Studio</strong> for free daily usage, or use <strong>Ollama (Local AI)</strong> to run small, efficient models (like 2B-4B parameters) entirely for free on your own hardware!
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex items-center gap-2 w-full md:w-auto px-8">
              {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? "Settings Saved!" : "Save Settings"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />

      <Modal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)}
        title={`Setup Guide: ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
        size="md"
      >
        <div className="pb-4">
          {renderGuideContent()}
          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <Button variant="primary" onClick={() => setShowGuideModal(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
