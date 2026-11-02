import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { validarCpf, somenteNumeros, REGEX_SENHA } from "../utils/validacoes";
import { Input } from "../components/Input";
import { Botao } from "../components/Botao";
import { atualizarPerfil } from "../services/autenticacao";
import { ApiError } from "../services/api";
import { useUsuario } from "../contexts/UsuarioContext";
import "./Auth.css";

interface Erros {
    nome?: string;
    cpf?: string;
    senha?: string;
    confirmarSenha?: string;
}

export function Perfil() {
    const { usuario, atualizarUsuario } = useUsuario();
    const [nome, setNome] = useState(usuario?.nome ?? "");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");
        setSucesso("");

        const novosErros: Erros = {};

        if (nome.trim() === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.trim().length < 3) {
            novosErros.nome = "O nome deve ter pelo menos 3 caracteres.";
        }

        if (cpf === "") {
            novosErros.cpf = "Informe o CPF.";
        } else if (!validarCpf(cpf)) {
            novosErros.cpf = "CPF inválido.";
        }

        if (senha === "") {
            novosErros.senha = "Informe a senha.";
        } else if (senha.length < 8) {
            novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
        } else if (!REGEX_SENHA.test(senha)) {
            novosErros.senha =
                "Use letra maiúscula, minúscula, número e caractere especial.";
        }

        if (confirmarSenha === "") {
            novosErros.confirmarSenha = "Confirme a senha.";
        } else if (senha !== confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não conferem.";
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
                senha,
                confirmacaoSenha: confirmarSenha,
            });

            if (usuario) {
                atualizarUsuario({ ...usuario, nome: nome.trim() });
            }

            setSenha("");
            setConfirmarSenha("");
            setSucesso("Dados atualizados com sucesso.");
        } catch (erro) {
            if (erro instanceof ApiError) {
                setErroGeral(erro.message);
            } else {
                setErroGeral("Erro inesperado. Tente novamente.");
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Meus dados</h1>

                <form onSubmit={handleSubmit} noValidate className="auth-form">
                    <Input
                        type="email"
                        placeholder="E-mail"
                        value={usuario?.email ?? ""}
                        onChange={() => {}}
                        disabled
                    />

                    <Input
                        type="text"
                        placeholder="Nome completo"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        erro={erros.nome}
                    />

                    <Input
                        type="text"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(event) => setCpf(event.target.value)}
                        erro={erros.cpf}
                    />

                    <Input
                        type="password"
                        placeholder="Nova senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        erro={erros.senha}
                    />

                    <Input
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        erro={erros.confirmarSenha}
                    />

                    {erroGeral && (
                        <p role="alert" className="form-alert">
                            {erroGeral}
                        </p>
                    )}

                    {sucesso && <p role="status">{sucesso}</p>}

                    <Botao type="submit" disabled={enviando}>
                        Salvar
                    </Botao>
                </form>

                <p className="auth-footer">
                    <Link to="/admin/home">Voltar</Link>
                </p>
            </div>
        </div>
    );
}