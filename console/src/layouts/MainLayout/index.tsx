import { Suspense } from "react";
import { Layout, Spin } from "antd";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../Sidebar";
import Header from "../Header";
import ConsoleCronBubble from "../../components/ConsoleCronBubble";
import { ChunkErrorBoundary } from "../../components/ChunkErrorBoundary";
import { lazyImportWithRetry } from "../../utils/lazyWithRetry";
import { usePlugins } from "../../plugins/PluginContext";
import styles from "../index.module.less";

// Chat is eagerly loaded (default landing page)
import Chat from "../../pages/Chat";

// All other pages are lazily loaded with automatic retry on chunk failure
const AgentConfigPage = lazyImportWithRetry("../../pages/Agent/Config");
const SkillsPage = lazyImportWithRetry("../../pages/Agent/Skills");
const SkillPoolPage = lazyImportWithRetry("../../pages/Settings/SkillPool");
const ToolsPage = lazyImportWithRetry("../../pages/Agent/Tools");
const WorkspacePage = lazyImportWithRetry("../../pages/Agent/Workspace");
const MCPPage = lazyImportWithRetry("../../pages/Agent/MCP");
const ACPPage = lazyImportWithRetry("../../pages/Agent/ACP");
const ModelsPage = lazyImportWithRetry("../../pages/Settings/Models");
const TokenUsagePage = lazyImportWithRetry("../../pages/Settings/TokenUsage");
const AgentStatsPage = lazyImportWithRetry("../../pages/Settings/AgentStats");
const VoiceTranscriptionPage = lazyImportWithRetry(
  "../../pages/Settings/VoiceTranscription",
);
const DebugPage = lazyImportWithRetry("../../pages/Settings/Debug");
const BackupsPage = lazyImportWithRetry("../../pages/Settings/Backups");

const { Content } = Layout;

const pathToKey: Record<string, string> = {
  "/chat": "chat",
  "/skills": "skills",
  "/skill-pool": "skill-pool",
  "/tools": "tools",
  "/mcp": "mcp",
  "/acp": "acp",
  "/workspace": "workspace",
  "/models": "models",
  "/agent-config": "agent-config",
  "/token-usage": "token-usage",
  "/agent-stats": "agent-stats",
  "/voice-transcription": "voice-transcription",
  "/debug": "debug",
  "/backups": "backups",
};

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;
  const { pluginRoutes } = usePlugins();

  // Resolve selected key: check static routes first, then plugin routes
  let selectedKey = pathToKey[currentPath] || "";
  if (!selectedKey) {
    const matchedPlugin = pluginRoutes.find(
      (route) => currentPath === route.path,
    );
    selectedKey = matchedPlugin
      ? matchedPlugin.path.replace(/^\//, "")
      : "chat";
  }

  return (
    <Layout className={styles.mainLayout}>
      <Header />
      <Layout>
        <Sidebar selectedKey={selectedKey} />
        <Content className="page-container">
          <ConsoleCronBubble />
          <div className="page-content">
            <ChunkErrorBoundary resetKey={currentPath}>
              <Suspense
                fallback={
                  <Spin
                    tip={t("common.loading")}
                    style={{ display: "block", margin: "20vh auto" }}
                  />
                }
              >
                <Routes>
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                  <Route path="/chat/*" element={<Chat />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/skill-pool" element={<SkillPoolPage />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/mcp" element={<MCPPage />} />
                  <Route path="/acp" element={<ACPPage />} />
                  <Route path="/ACP" element={<Navigate to="/acp" replace />} />
                  <Route path="/workspace" element={<WorkspacePage />} />
                  <Route path="/models" element={<ModelsPage />} />
                  <Route path="/agent-config" element={<AgentConfigPage />} />
                  <Route path="/token-usage" element={<TokenUsagePage />} />
                  <Route path="/agent-stats" element={<AgentStatsPage />} />
                  <Route
                    path="/voice-transcription"
                    element={<VoiceTranscriptionPage />}
                  />
                  <Route path="/debug" element={<DebugPage />} />
                  <Route path="/backups" element={<BackupsPage />} />

                  {/* Plugin routes — dynamically injected at runtime */}
                  {pluginRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<route.component />}
                    />
                  ))}
                </Routes>
              </Suspense>
            </ChunkErrorBoundary>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
