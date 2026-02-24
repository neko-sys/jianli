import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestChat } from '../core/ai/ollamaClient';
import { Button } from '../shared/ui/Button';
import { Card } from '../shared/ui/Card';
import { Input } from '../shared/ui/Input';
import { Label } from '../shared/ui/Label';
import { useSettingsStore } from '../store/useSettingsStore';

export const SettingsPage = () => {
  const { ollama, setOllama } = useSettingsStore();
  const [form, setForm] = useState(ollama);
  const [message, setMessage] = useState('');

  return (
    <main className="page page-narrow">
      <header className="topbar">
        <h1>设置</h1>
        <Button asChild variant="secondary">
          <Link to="/">返回</Link>
        </Button>
      </header>
      <Card title="Ollama 配置">
        <Label>Base URL</Label>
        <Input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
        <Label>模型</Label>
        <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        <Label>temperature</Label>
        <Input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} />
        <Label>maxTokens</Label>
        <Input type="number" value={form.maxTokens} onChange={(e) => setForm({ ...form, maxTokens: Number(e.target.value) })} />
        <div className="row-actions">
          <Button
            onClick={() => {
              setOllama(form);
              setMessage('已保存');
            }}
          >
            保存
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              setMessage('连接测试中...');
              try {
                await requestChat(form, '你是助手', '回复“ok”');
                setMessage('连接成功');
              } catch (error) {
                setMessage(error instanceof Error ? error.message : '连接失败');
              }
            }}
          >
            测试连接
          </Button>
        </div>
        {message && <p>{message}</p>}
      </Card>
    </main>
  );
};
