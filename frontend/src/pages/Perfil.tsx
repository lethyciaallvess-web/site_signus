import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { REGEX_SENHA, validarCpf, validarCnpj, validarNome, somenteNumeros } from "../utils/validacoes";
import { mascararCnpj, mascararCpf, mascararNome } from "../utils/mascaras";
import { rotaInicial } from "../utils/perfis";
import { formatarIniciais, rotulosPerfil } from "../utils/formatacoes";
import { Input } from "../components/Input";
import { Botao } from "../components/Botao";
import { atualizarPerfil, obterPerfil } from "../services/autenticacao";
import { ApiError } from "../services/api";
import { useUsuario } from "../contexts/UsuarioContext";
import "./Auth.css";
import "./Perfil.css";

interface Erros {
    nome?: string;
    cpf?: string;
    cnpj?: string;
    senhaAtual?: string;
    senha?: string;
    confirmarSenha?: string;
}

type LinhaProps = {
    rotulo: string;
    valor: string;
};

function Linha({ rotulo, valor }: LinhaProps) {
    return (
        <div className="perfil-linha">
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
        </div>
    );
}

export function Perfil() {
    const { usuario, atualizarUsuario } = useUsuario();
    const [editando, setEditando] = useState(false);
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [senhaAtual, setSenhaAtual] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [enviando, setEnviando] = useState(false);

    function limparSenhas() {
        setSenhaAtual("");
        setSenha("");
        setConfirmarSenha("");
    }

    async function handleAbrir() {
        setErros({});
        setErroGeral("");
        setSucesso("");
        limparSenhas();

        try {
            const dados = await obterPerfil();
            setNome(dados.nome);
            setCpf(mascararCpf(dados.cpf));
            setCnpj(dados.cnpj ? mascararCnpj(dados.cnpj) : "");
            setEditando(true);
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        }
    }

    function handleCancelar() {
        setEditando(false);
        setErros({});
        setErroGeral("");
        limparSenhas();
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};

        if (nome.trim() === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.trim().length < 3) {
            novosErros.nome = "O nome deve ter pelo menos 3 caracteres.";
        } else if (!validarNome(nome)) {
            novosErros.nome = "Use apenas letras no nome.";
        }

        if (cpf.trim() === "") {
            novosErros.cpf = "Informe o CPF.";
        } else if (!validarCpf(cpf)) {
            novosErros.cpf = "CPF inválido.";
        }

        if (cnpj !== "" && !validarCnpj(cnpj)) {
            novosErros.cnpj = "CNPJ inválido.";
        }

        const trocarSenha = senhaAtual !== "" || senha !== "" || confirmarSenha !== "";

        if (trocarSenha) {
            if (senhaAtual === "") {
                novosErros.senhaAtual = "Informe a senha atual.";
            }

            if (senha === "") {
                novosErros.senha = "Informe a nova senha.";
            } else if (senha.length < 8) {
                novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
            } else if (!REGEX_SENHA.test(senha)) {
                novosErros.senha = "Use letra maiúscula, minúscula, número e caractere especial.";
            }

            if (confirmarSenha === "") {
                novosErros.confirmarSenha = "Confirme a nova senha.";
            } else if (senha !== confirmarSenha) {
                novosErros.confirmarSenha = "As senhas não conferem.";
            }
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        setEnviando(true);
        try {
            await atualizarPerfil({
                nome: nome.trim(),
                cpf: somenteNumeros(cpf),
                cnpj: cnpj === "" ? null : somenteNumeros(cnpj),
                ...(trocarSenha ? { senhaAtual, senha, confirmacaoSenha: confirmarSenha } : {}),
            });

            if (usuario) {
                atualizarUsuario({ ...usuario, nome: nome.trim() });
            }

            limparSenhas();
            setEditando(false);
            setSucesso("Dados atualizados com sucesso.");
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    const nomeAtual = usuario?.nome ?? "";
    const rotuloPerfil = usuario ? (rotulosPerfil[usuario.perfil] ?? usuario.perfil) : "";

    return (
        <div className="auth-page perfil-page">
            <div className="perfil-card">
                <div className="perfil-topo">
                    <div className="perfil-avatar">{formatarIniciais(nomeAtual)}</div>
                    <h1>{nomeAtual}</h1>
                    <p className="perfil-email">{usuario?.email}</p>
                    {rotuloPerfil && <span className="perfil-selo">{rotuloPerfil}</span>}
                </div>

                {sucesso && (
                    <p role="status" className="perfil-sucesso">
                        {sucesso}
                    </p>
                )}

                {erroGeral && (
                    <p role="alert" className="form-alert perfil-alerta">
                        {erroGeral}
                    </p>
                )}

                <section className="perfil-secao">
                    <div className="perfil-secao-cabecalho">
                        <h2>Meus dados</h2>
                        {!editando && (
                            <button type="button" className="perfil-link" onClick={handleAbrir}>
                                Editar dados
                            </button>
                        )}
                    </div>

                    {editando ? (
                        <form onSubmit={handleSubmit} noValidate className="perfil-form">
                            <Input
                                type="text"
                                placeholder="Nome completo"
                                obrigatorio
                                maxLength={180}
                                value={nome}
                                onChange={(event) => setNome(mascararNome(event.target.value))}
                                erro={erros.nome}
                            />

                            <Input
                                type="email"
                                placeholder="E-mail (não pode ser alterado)"
                                value={usuario?.email ?? ""}
                                onChange={() => {}}
                                disabled
                            />

                            <Input
                                type="text"
                                placeholder="CPF"
                                obrigatorio
                                maxLength={14}
                                inputMode="numeric"
                                value={cpf}
                                onChange={(event) => setCpf(mascararCpf(event.target.value))}
                                erro={erros.cpf}
                            />

                            <Input
                                type="text"
                                placeholder="CNPJ (somente se for empresa)"
                                maxLength={18}
                                inputMode="numeric"
                                value={cnpj}
                                onChange={(event) => setCnpj(mascararCnpj(event.target.value))}
                                erro={erros.cnpj}
                            />

                            <p className="auth-aviso">Para trocar a senha, preencha os campos abaixo. Se não quiser trocar, deixe em branco.</p>

                            <Input
                                type="password"
                                placeholder="Senha atual"
                                maxLength={72}
                                value={senhaAtual}
                                onChange={(event) => setSenhaAtual(event.target.value)}
                                erro={erros.senhaAtual}
                            />

                            <Input
                                type="password"
                                placeholder="Nova senha"
                                maxLength={72}
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                erro={erros.senha}
                            />

                            <Input
                                type="password"
                                placeholder="Confirmar nova senha"
                                maxLength={72}
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                erro={erros.confirmarSenha}
                            />

                            <div className="perfil-acoes">
                                <Botao type="submit" disabled={enviando}>
                                    Salvar
                                </Botao>
                                <button
                                    type="button"
                                    className="perfil-cancelar"
                                    onClick={handleCancelar}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <dl>
                            <Linha rotulo="Nome" valor={nomeAtual} />
                            <Linha rotulo="E-mail" valor={usuario?.email ?? ""} />
                            <Linha rotulo="CPF" valor="•••.•••.•••-••" />
                            <Linha rotulo="Senha" valor="••••••••" />
                        </dl>
                    )}
                </section>

                <p className="perfil-rodape">
                    <Link to={usuario ? rotaInicial(usuario.perfil) : "/"}>Voltar</Link>
                </p>
            </div>
        </div>
    );
}