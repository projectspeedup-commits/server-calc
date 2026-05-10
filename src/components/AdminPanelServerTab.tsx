import React, { useState } from "react";
import { Terminal, Shield, Key, RefreshCw, CheckCircle2, AlertCircle, Copy, Power } from "lucide-react";
import { updateAuth } from "../services/apiService";

export const AdminPanelServerTab: React.FC = () => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername && !newPassword) return;

    setIsUpdating(true);
    setStatus(null);

    const token = window.localStorage.getItem("arsenal_auth_token");

    try {
      const result = await updateAuth({ token, newUsername, newPassword });
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setNewUsername("");
        setNewPassword("");
      } else {
        setStatus({ type: 'error', message: result.error || "Ошибка при обновлении" });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Ошибка соединения с сервером" });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Change Credentials Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Управление паролями</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Смена логина и пароля администратора</p>
          </div>
        </div>

        <form onSubmit={handleUpdateAuth} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Новый логин</label>
            <div className="relative">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Напр. admin_main"
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
              />
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Новый пароль</label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
              />
              <RefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isUpdating || (!newUsername && !newPassword)}
              className="px-6 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Обновить учетные данные"}
            </button>
            
            {status && (
              <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Technical Instructions Section */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Terminal className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Инструкция по работе с сервером</h3>
              <p className="text-sm text-slate-400 text-balance">Техническая документация для администратора и разработчика</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Доступы & Адреса
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Локальный адрес:</span>
                    <code className="text-indigo-300">http://localhost:3000</code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Логин по умолчанию:</span>
                    <code className="text-emerald-400">admin</code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Пароль по умолчанию:</span>
                    <code className="text-emerald-400">admin</code>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    * Вы можете изменить эти учетные данные в форме выше.
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  GitHub & Авто-обновление
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed text-balance">
                  Используйте синхронизацию через GitHub для обновления кода на сервере.
                  Ваш репозиторий:
                  <a href="https://github.com/projectspeedup-commits/server-calc" target="_blank" rel="noreferrer" className="block text-indigo-400 hover:underline mt-1 font-mono text-[11px] break-all">
                    https://github.com/projectspeedup-commits/server-calc
                  </a>
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Команда для обновления кода:</p>
                  <div className="bg-slate-950 p-4 rounded-xl font-mono text-sm border border-slate-800 group relative">
                    <span className="text-slate-500">$</span> <span className="text-emerald-400">git</span> pull origin main
                    <button onClick={() => copyToClipboard("git pull origin main")} className="absolute right-4 top-4 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                  Internet / Cloud Deployment
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Для запуска программы в интернете (на VPS) рекомендуется использовать <b>Docker</b>. 
                  Это обеспечит стабильность и легкий перенос.
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Запуск в облаке:</p>
                  <div className="bg-slate-950 p-4 rounded-xl font-mono text-sm border border-slate-800 group relative">
                    <span className="text-slate-500">$</span> <span className="text-emerald-400">docker-compose</span> up -d --build
                    <button onClick={() => copyToClipboard("docker-compose up -d --build")} className="absolute right-4 top-4 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  * Эта команда скачает все зависимости, соберет проект и запустит его в фоновом режиме.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  Внешний доступ (Доступ из интернета)
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Чтобы коллеги могли зайти на сервер с любого устройства, используйте <b>Cloudflare Tunnel</b>. Это бесплатно и безопасно.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-[11px] text-indigo-400 font-bold uppercase">Шаг 1: Установка</p>
                    <code className="text-xs text-slate-400">brew install cloudflare/cloudflare/cloudflared</code>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-[11px] text-indigo-400 font-bold uppercase">Шаг 2: Запуск туннеля</p>
                    <div className="bg-slate-900 p-2 rounded font-mono text-[11px] break-all">
                      cloudflared tunnel --url http://localhost:3000
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 font-medium"> 
                  * После запуска вы получите ссылку (напр. clinical-parts-move.trycloudflare.com), по которой сайт будет доступен всему миру.
                </p>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Подготовка & Переход
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Приложение должно находиться в папке <code className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300">zmk-arsenal-server</code>.
                  Перед запуском команд необходимо перейти в эту директорию через терминал.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-sm border border-slate-800 group relative">
                  <span className="text-slate-500">$</span> <span className="text-emerald-400">cd</span> path/to/zmk-arsenal-server
                  <button onClick={() => copyToClipboard("cd path/to/zmk-arsenal-server")} className="absolute right-4 top-4 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Запуск Сервера
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Для локальной работы используйте команду <code className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300">npm run dev</code>. 
                  Это запустит сервер на <span className="text-white font-medium">http://localhost:3000</span>.
                </p>
                <div className="bg-slate-950 p-4 rounded-xl font-mono text-sm border border-slate-800 group relative">
                  <span className="text-slate-500">$</span> <span className="text-emerald-400">npm</span> run dev
                  <button onClick={() => copyToClipboard("npm run dev")} className="absolute right-4 top-4 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 italic">Примечание: Если возникла ошибка "ENOENT", значит вы находитесь не в той папке. Используйте команду 'cd'.</p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Остановка Сервера
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Чтобы остановить сервер, перейдите в окно терминала и нажмите комбинацию клавиш:
                </p>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1.5 bg-slate-800 border-b-4 border-slate-700 rounded-lg text-sm font-bold shadow-xl">Ctrl</kbd>
                  <span className="text-slate-500">+</span>
                  <kbd className="px-3 py-1.5 bg-slate-800 border-b-4 border-slate-700 rounded-lg text-sm font-bold shadow-xl">C</kbd>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                  Основные Команды
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span><code className="text-indigo-300 bg-slate-800 px-1 rounded">npm install</code> — Установка всех нужных библиотек. Нужно выполнить один раз после скачивания архива.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span><code className="text-indigo-300 bg-slate-800 px-1 rounded">ls</code> — Показать файлы в текущей папке (убедитесь, что видите package.json).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span><code className="text-indigo-300 bg-slate-800 px-1 rounded">pwd</code> — Показать полный путь, где вы сейчас находитесь.</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 shrink-0">
               <Power className="w-8 h-8" />
            </div>
            <div>
               <h5 className="font-bold text-white mb-1">Важно для работы базы данных</h5>
               <p className="text-sm text-slate-400">Данные хранятся в папке <code className="text-indigo-300 bg-slate-900 px-1 rounded">/data</code> в файле <code className="text-indigo-300 bg-slate-900 px-1 rounded">arsenal.db</code>. Не удаляйте эту папку, если хотите сохранить историю расчетов и настройки.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
