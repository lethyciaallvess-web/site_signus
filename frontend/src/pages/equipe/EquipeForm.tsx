import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Botao } from "../../components/Botao";
import { criarFuncionario } from "../../services/equipe";
import { ApiError } from "../../services/api";
import { REGEX_SENHA, somenteNumeros, validarCpf, validarEmail } from "../../utils/validacoes";
import { mascararCpf } from "../../utils/mascaras";
import { PERFIL_ADMIN, PERFIL_OPERADOR } from "../../utils/perfis";

type FormFuncionario = {
    nome: string;
    email: string;
    cpf: string;
    perfil: string;
    senha: string;
    confirmacaoSenha: string;
};

type Erros = {
    nome?: string;
    email?: string;
    cpf?: string;
    senha?: string;
    confirmacaoSenha?: string;
};

const formVazio: FormFuncionario = {
    nome: "",
    email: "",
    cpf: "",
    perfil: PERFIL_OPERADOR,
    senha: "",
    confirmacaoSenha: "",
};

export function EquipeForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormFuncionario>(formVazio);
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};
        const nome = form.nome.trim();
        const email = form.email.trim();

        if (nome === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.length < 3 || nome.length > 180) {
            novosErros.nome = "O nome deve ter entre 3 e 180 caracteres.";
        }

        if (email === "") {
            novosErros.email = "Informe o e-mail.";
        } else if (!validarEmail(email)) {
            novosErros.email = "E-mail inválido.";
        }

        if (form.cpf === "") {
            novosErros.cpf = "Informe o CPF.";
        } else if (!validarCpf(form.cpf)) {
            novosErros.cpf = "CPF inválido.";
        }

        if (form.senha === "") {
            novosErros.senha = "Informe a senha.";
        } else if (form.senha.length < 8) {
            novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
        } else if (!REGEX_SENHA.test(form.senha)) {
            novosErros.senha = "Use letra maiúscula, minúscula, número e caractere especial.";
        }

        if (form.confirmacaoSenha === "") {
            novosErros.confirmacaoSenha = "Confirme a senha.";
        } else if (form.senha !== form.confirmacaoSenha) {
            novosErros.confirmacaoSenha = "As senhas não conferem.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        setEnviando(true);
        try {
            await criarFuncionario({
                nome,
                email,
                cpf: somenteNumeros(form.cpf),
                perfil: form.perfil,
                senha: form.senha,
                confirmacaoSenha: form.confirmacaoSenha,
            });
            navigate("/admin/equipe");
        } catch (erroApi) {
            setErroGeral(
                erroApi instanceof ApiError
                    ? erroApi.message
                    : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div>
            <h1>Novo funcionário</h1>

            <form onSubmit={handleSubmit} noValidate className="formulario">
                <Input
                    type="text"
                    placeholder="Nome completo"
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: event.target.value })}
                    erro={erros.nome}
                />

                <Input
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    erro={erros.email}
                />

                <Input
                    type="text"
                    placeholder="CPF"
                    value={form.cpf}
                    onChange={(event) => setForm({ ...form, cpf: mascararCpf(event.target.value) })}
                    erro={erros.cpf}
                />

                <Select
                    rotulo="Perfil"
                    value={form.perfil}
                    onChange={(event) => setForm({ ...form, perfil: event.target.value })}
                    opcoes={[
                        { valor: PERFIL_OPERADOR, texto: "Operador" },
                        { valor: PERFIL_ADMIN, texto: "Administrador" },
                    ]}
                />

                <Input
                    type="password"
                    placeholder="Senha"
                    value={form.senha}
                    onChange={(event) => setForm({ ...form, senha: event.target.value })}
                    erro={erros.senha}
                />

                <Input
                    type="password"
                    placeholder="Confirmar senha"
                    value={form.confirmacaoSenha}
                    onChange={(event) => setForm({ ...form, confirmacaoSenha: event.target.value })}
                    erro={erros.confirmacaoSenha}
                />

                {erroGeral && (
                    <p role="alert" className="form-alert">
                        {erroGeral}
                    </p>
                )}

                <div className="form-actions">
                    <Botao type="submit" disabled={enviando}>
                        Cadastrar
                    </Botao>
                    <Link to="/admin/equipe">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}