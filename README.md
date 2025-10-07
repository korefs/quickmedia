# QuickMedia

Downloader de mídia minimalista para macOS que vive na menu bar.

## Funcionalidades

- **Menu Bar App**: Ícone discreto na barra de menu do macOS
- **Drag & Drop**: Arraste URLs diretamente para o ícone
- **Clipboard Monitor**: Detecta automaticamente URLs de mídia copiadas
- **Interface Minimalista**: Popup de 400x500px com design clean
- **Downloads Simultâneos**: Até 3 downloads ao mesmo tempo
- **Hotkey Global**: `Cmd+Shift+D` para baixar URL do clipboard
- **Notificações Nativas**: Alertas quando downloads concluem
- **Histórico**: Últimos 10 downloads

## Pré-requisitos

- macOS
- Node.js 18+
- yt-dlp instalado via Homebrew:
  ```bash
  brew install yt-dlp
  ```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Isso irá iniciar o Electron em modo de desenvolvimento com hot-reload.

## Build

```bash
npm run build
npm run package
```

O app compilado estará em `release/`.

## Configurações

- **Pasta de destino**: Escolha onde salvar os downloads (padrão: ~/Downloads)
- **Qualidade**: Best, 1080p, 720p, ou Audio Only
- **Formato**: MP4, WebM, ou MP3
- **Auto-download**: Detectar e sugerir download de URLs copiadas
- **Notificações**: Mostrar alertas ao concluir downloads
- **Iniciar com sistema**: Abrir automaticamente ao fazer login
- **Usar cookies do navegador**: Ative para baixar conteúdo que requer login (TikTok, Instagram, etc.)
  - Selecione o navegador onde você está logado (Chrome, Firefox, Safari, Edge)
  - O app usará os cookies do navegador para acessar conteúdo privado/protegido

## Uso

1. Clique no ícone na menu bar para abrir a interface
2. Cole uma URL ou arraste para a área de drop
3. Ou simplesmente copie uma URL e use `Cmd+Shift+D`
4. Arraste URLs diretamente para o ícone na menu bar

### Download de Conteúdo Protegido

Para sites que requerem login (TikTok, Instagram, conteúdo privado):

1. Certifique-se de estar logado no site no seu navegador (Chrome, Safari, etc.)
2. Abra as Configurações do QuickMedia
3. Ative **"Usar cookies do navegador"**
4. Selecione o navegador onde você está logado
5. Tente baixar o conteúdo novamente

O QuickMedia irá usar os cookies do seu navegador para autenticar e acessar o conteúdo.

## Tecnologias

- Electron
- React + TypeScript
- Tailwind CSS
- yt-dlp
- electron-store

## Licença

MIT
