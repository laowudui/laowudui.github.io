#!/bin/sh
set -e

DISTRO=$(lsb_release -cs)

echo "正在更新系统[grub]..."
sudo install -Dm 664 /dev/stdin /etc/default/grub.d/grub.cfg <<'EOF'
GRUB_CMDLINE_LINUX_DEFAULT=""
GRUB_TIMEOUT=5
GRUB_TIMEOUT_STYLE=menu
GRUB_DISABLE_OS_PROBER=false
GRUB_GFXMODE="1600x1200,1280x1024,auto"
EOF
sudo update-grub

echo "正在更新系统[fwupd]..."
sudo fwupdmgr refresh --force
sudo fwupdmgr update

echo "正在更新系统[apt]..."
sudo install -Dm 664 /dev/stdin /etc/apt/sources.list.d/ubuntu.sources <<EOF
Types: deb deb-src
URIs: https://mirrors.ustc.edu.cn/ubuntu
Suites: $DISTRO $DISTRO-updates $DISTRO-backports
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

Types: deb deb-src
URIs: https://mirrors.ustc.edu.cn/ubuntu
Suites: $DISTRO-security
Components: main restricted universe multiverse
Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
EOF
sudo dpkg --add-architecture i386
sudo apt update
sudo apt full-upgrade -y

echo "正在安装软件[apt]..."
sudo apt install -y \
    build-essential \
    git \
    git-lfs \
    curl \
    sqlite3 \
    sqlitebrowser \
    showtime \
    steam-installer \
    ttf-mscorefonts-installer \
    fonts-lato \
    fonts-noto \
    python3-venv \
    ubuntu-restricted-extras \
    virtualbox \
    virtualbox-ext-pack \
    virtualbox-guest-additions-iso \
    gnome-user-share \
    gnome-calendar \
    gnome-music \
    gnome-system-monitor \
    gnome-shell-extension-manager \
    gnome-shell-extension-apps-menu \
    gnome-shell-extension-places-menu \
    gnome-shell-extension-system-monitor

echo "正在安装驱动..."
sudo ubuntu-drivers install --include-dkms

echo "卸载冗余软件..."
sudo apt purge -y \
    sysprof \
    resources \
    gnome-calculator

echo "正在清理冗余依赖..."
sudo apt autoremove -y --purge

echo "正在安装软件[补充]..."
# tailscale
curl -fsSL https://tailscale.com/install.sh | sh

echo "正在配置系统软件..."
# server
sudo install -D /dev/stdin /usr/bin/server <<'EOF'
#!/bin/sh
set -e
python3 -m http.server -b 0.0.0.0 3000
EOF

# virtualbox
sudo usermod -aG vboxusers $USER

# tailscale
sudo install -Dm 644 /dev/stdin /usr/share/applications/tailscale.desktop <<'EOF'
[Desktop Entry]
Name=Tailscale
Comment=Tailscale 服务管理
Exec=bash -c "tailscale status; sleep 3"
Icon=nm-vpn-standalone-lock-symbolic
Terminal=true
Type=Application
Categories=Network;
Actions=Up;Down;

[Desktop Action Up]
Name=启动服务
Exec=bash -c "sudo tailscale up --accept-routes; sleep 3"

[Desktop Action Down]
Name=关闭服务
Exec=bash -c "sudo tailscale down"
EOF


echo "正在配置[~/.bash_aliases]..."
install -Dm 664 /dev/stdin ~/.bash_aliases <<'EOF'
# ~/.bashrc.d
if [ -d ~/.bashrc.d ]; then
    for rc in ~/.bashrc.d/*.sh; do
        if [ -r "$rc" ]; then
            . "$rc"
        fi
    done
    unset rc
fi

bind "set completion-ignore-case on"
EOF


echo "正在配置[python3]..."
install -Dm 664 /dev/stdin ~/.bashrc.d/python3.sh <<'EOF'
export PYTHON3_HOME="$HOME/.local/opt/python3"
export PATH="$PYTHON3_HOME/bin:$PATH"

python3_init() {
    echo "清理历史版本..."
    rm -rf "$PYTHON3_HOME"

    echo "正在创建虚拟环境[python3]..."
    python3 -m venv "$PYTHON3_HOME"
}
EOF
install -Dm 664 /dev/stdin ~/.config/pip/pip.conf <<'EOF'
[global]
index-url = https://mirrors.ustc.edu.cn/pypi/simple
EOF


echo "正在配置[node]..."
install -Dm 664 /dev/stdin ~/.bashrc.d/node.sh <<'EOF'
export NODE_HOME="$HOME/.local/opt/node"
export PATH="$NODE_HOME/bin:$PATH"
export PATH="$HOME/.local/share/pnpm/bin:$PATH"

node_init() {
    local mirror="https://cdn.npmmirror.com/binaries/node"
    local version="24.16.0"

    echo "清理历史版本..."
    rm -rf "$NODE_HOME"

    echo "正在安装[node]..."
    mkdir -p "$NODE_HOME"
    curl -#fSL "$mirror/v$version/node-v$version-linux-x64.tar.xz" | tar --strip-components=1 -xJC "$NODE_HOME"

    echo "正在安装[pnpm]..."
    npm i -g pnpm
}
EOF
install -Dm 664 /dev/stdin ~/.npmrc <<'EOF'
registry=https://registry.npmmirror.com
EOF


echo "正在配置[rust]..."
install -Dm 664 /dev/stdin ~/.bashrc.d/rust.sh <<'EOF'
export CARGO_HOME="$HOME/.local/opt/cargo"
export PATH="$CARGO_HOME/bin:$PATH"
export RUSTUP_HOME="$HOME/.local/opt/rustup"
export RUSTUP_DIST_SERVER="https://rsproxy.cn"
export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup"

rust_init() {
    echo "清理历史版本..."
    rm -rf "$CARGO_HOME"
    rm -rf "$RUSTUP_HOME"

    echo "正在安装[rust]..."
    local file=$(mktemp)
    curl -#fSL https://rsproxy.cn/rustup-init.sh -o "$file" && sh "$file" --no-modify-path
}
EOF
install -Dm 664 /dev/stdin ~/.cargo/config.toml <<'EOF'
[source.crates-io]
replace-with = "rsproxy"

[source.rsproxy]
registry = "sparse+https://rsproxy.cn/index/"
EOF


echo "正在配置[go]..."
install -Dm 664 /dev/stdin ~/.bashrc.d/go.sh <<'EOF'
export GO_HOME="$HOME/.local/opt/go"
export PATH="$GO_HOME/bin:$PATH"

go_init() {
    local mirror="https://mirrors.aliyun.com/golang"
    local version="1.26.4"

    echo "清理历史版本..."
    rm -rf "$GO_HOME"

    echo "正在安装[go]..."
    mkdir -p "$GO_HOME"
    curl -#fSL "$MIRROR/go$VERSION.linux-amd64.tar.gz" | tar --strip-components=1 -xzC "$GO_HOME"
}
EOF
install -Dm 664 /dev/stdin ~/.config/go/env <<'EOF'
GO111MODULE=on
GOPROXY=https://goproxy.cn,direct
EOF


echo "正在配置[~/.gitconfig]..."
install -Dm 664 /dev/stdin ~/.gitconfig <<'EOF'
[safe]
    directory = *

[core]
    autocrlf = input
    quotepath = false

[init]
    defaultBranch = main

[pull]
    rebase = true

[rebase]
    autoStash = true

[user]
    name = laowudui
    email = laowudui@gmail.com

[filter "lfs"]
    required = true
    clean = git-lfs clean -- %f
    smudge = git-lfs smudge -- %f
    process = git-lfs filter-process
EOF


KEY_TYPE="ed25519"
KEY_PATH="$HOME/.ssh/id_$KEY_TYPE"
if [ ! -f "$KEY_PATH" ]; then
    echo "正在生成[SSH 密钥]..."
    ssh-keygen -t "$KEY_TYPE" -C "$(whoami)@$(hostname)" -N "" -f "$KEY_PATH"
fi
echo "SSH 公钥:"
cat "$KEY_PATH.pub"
