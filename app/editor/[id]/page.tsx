/**
 * Editor Page
 * Monaco-based code editor with file tree and preview
 */

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    FolderOpen,
    FileCode,
    FileJson,
    FileText,
    Play,
    Save,
    Download,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    Settings,
    Loader2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonButton } from '@/components/ui/NeonButton';
import Editor from '@monaco-editor/react';

// =============================================================================
// TYPES
// =============================================================================

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
    content?: string;
}

interface Project {
    id: string;
    name: string;
    files: Record<string, string>;
    previewUrl?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'json':
            return FileJson;
        case 'md':
        case 'txt':
            return FileText;
        default:
            return FileCode;
    }
}

function getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        json: 'json',
        css: 'css',
        scss: 'scss',
        html: 'html',
        md: 'markdown',
        py: 'python',
        sql: 'sql',
    };
    return langMap[ext ?? ''] ?? 'plaintext';
}

function buildFileTree(files: Record<string, string>): FileNode[] {
    const root: FileNode[] = [];
    const paths = Object.keys(files).sort();

    for (const path of paths) {
        const parts = path.split('/');
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            const isFile = i === parts.length - 1;
            const currentPath = parts.slice(0, i + 1).join('/');

            let existing = current.find((n) => n.name === name);

            if (!existing) {
                existing = {
                    name,
                    path: currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: isFile ? undefined : [],
                    content: isFile ? files[path] : undefined,
                };
                current.push(existing);
            }

            if (!isFile && existing.children) {
                current = existing.children;
            }
        }
    }

    return root;
}

// =============================================================================
// FILE TREE COMPONENT
// =============================================================================

function FileTree({
    nodes,
    selectedPath,
    onSelect,
    level = 0,
}: {
    nodes: FileNode[];
    selectedPath: string | null;
    onSelect: (node: FileNode) => void;
    level?: number;
}) {
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

    const toggleExpand = (path: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    return (
        <div className="space-y-0.5">
            {nodes.map((node) => {
                const Icon = node.type === 'folder' ? FolderOpen : getFileIcon(node.name);
                const isExpanded = expanded.has(node.path);
                const isSelected = selectedPath === node.path;

                return (
                    <div key={node.path}>
                        <button
                            onClick={() => {
                                if (node.type === 'folder') {
                                    toggleExpand(node.path);
                                } else {
                                    onSelect(node);
                                }
                            }}
                            className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors',
                                isSelected
                                    ? 'bg-neon-500/10 text-neon-400'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            )}
                            style={{ paddingLeft: `${level * 12 + 8}px` }}
                        >
                            {node.type === 'folder' && (
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {isExpanded ? (
                                        <ChevronDown className="w-3 h-3" />
                                    ) : (
                                        <ChevronRight className="w-3 h-3" />
                                    )}
                                </span>
                            )}
                            <Icon className={cn(
                                'w-4 h-4 flex-shrink-0',
                                node.type === 'folder' ? 'text-yellow-400' : 'text-blue-400'
                            )} />
                            <span className="truncate">{node.name}</span>
                        </button>

                        {node.type === 'folder' && isExpanded && node.children && (
                            <FileTree
                                nodes={node.children}
                                selectedPath={selectedPath}
                                onSelect={onSelect}
                                level={level + 1}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    // State
    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedFile, setSelectedFile] = React.useState<FileNode | null>(null);
    const [fileContent, setFileContent] = React.useState('');
    const [isDirty, setIsDirty] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(true);

    // File tree
    const fileTree = React.useMemo(() => {
        if (!project?.files) return [];
        return buildFileTree(project.files);
    }, [project?.files]);

    // Load project
    React.useEffect(() => {
        async function loadProject() {
            try {
                const res = await fetch(`/api/generate?projectId=${projectId}`);
                if (!res.ok) throw new Error('Project not found');

                const data = await res.json();
                setProject({
                    id: data.project.id,
                    name: data.project.name,
                    files: data.project.files ?? {},
                    previewUrl: data.project.previewUrl,
                });

                // Select first file
                const files = data.project.files;
                if (files) {
                    const firstFile = Object.keys(files)[0];
                    if (firstFile) {
                        setSelectedFile({
                            name: firstFile.split('/').pop() ?? firstFile,
                            path: firstFile,
                            type: 'file',
                            content: files[firstFile],
                        });
                        setFileContent(files[firstFile]);
                    }
                }
            } catch {
                toast.error('Projeto não encontrado');
                router.push('/dashboard/projects');
            } finally {
                setIsLoading(false);
            }
        }

        loadProject();
    }, [projectId, router]);

    // Handle file selection
    const handleFileSelect = (node: FileNode) => {
        if (node.type === 'file') {
            if (isDirty) {
                if (!confirm('Você tem alterações não salvas. Deseja continuar?')) {
                    return;
                }
            }
            setSelectedFile(node);
            setFileContent(node.content ?? '');
            setIsDirty(false);
        }
    };

    // Handle content change
    const handleContentChange = (value: string | undefined) => {
        if (value !== undefined) {
            setFileContent(value);
            setIsDirty(true);
        }
    };

    // Save file
    const handleSave = async () => {
        if (!selectedFile || !project) return;

        try {
            // Update project files
            const updatedFiles = { ...project.files, [selectedFile.path]: fileContent };
            setProject({ ...project, files: updatedFiles });
            setSelectedFile({ ...selectedFile, content: fileContent });
            setIsDirty(false);
            toast.success('Arquivo salvo!');
        } catch {
            toast.error('Erro ao salvar arquivo');
        }
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedFile, fileContent]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-neon-400 animate-spin" />
                    <p className="text-gray-400">Carregando projeto...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 glass border-b border-white/10 mb-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-white">{project.name}</h1>
                    {selectedFile && (
                        <span className="text-sm text-gray-400">
                            {selectedFile.path}
                            {isDirty && <span className="text-neon-400 ml-1">●</span>}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <NeonButton
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={!isDirty}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                    </NeonButton>
                    <NeonButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <X className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {showPreview ? 'Fechar Preview' : 'Preview'}
                    </NeonButton>
                    <NeonButton variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </NeonButton>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* File tree */}
                <GlowCard variant="default" padding="sm" className="w-64 overflow-y-auto">
                    <div className="mb-3">
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-2">
                            Arquivos
                        </h2>
                    </div>
                    <FileTree
                        nodes={fileTree}
                        selectedPath={selectedFile?.path ?? null}
                        onSelect={handleFileSelect}
                    />
                </GlowCard>

                {/* Editor */}
                <GlowCard variant="default" padding="none" className="flex-1 overflow-hidden">
                    {selectedFile ? (
                        <Editor
                            height="100%"
                            language={getLanguage(selectedFile.name)}
                            value={fileContent}
                            onChange={handleContentChange}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: 'JetBrains Mono, monospace',
                                minimap: { enabled: true },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                                padding: { top: 16 },
                            }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Selecione um arquivo para editar
                        </div>
                    )}
                </GlowCard>

                {/* Preview */}
                {showPreview && (
                    <GlowCard variant="default" padding="none" className="w-[400px] overflow-hidden">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                                <span className="text-sm text-gray-400">Preview</span>
                                <button
                                    className="p-1 hover:bg-white/5 rounded"
                                    onClick={() => setShowPreview(false)}
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                            <div className="flex-1 bg-white">
                                <iframe
                                    srcDoc={project.files['index.html'] ?? '<html><body><h1>Preview</h1></body></html>'}
                                    className="w-full h-full"
                                    title="Preview"
                                    sandbox="allow-scripts"
                                />
                            </div>
                        </div>
                    </GlowCard>
                )}
            </div>
        </div>
    );
}
