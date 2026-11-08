import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../../components/Input";
import { Botao } from "../../components/Botao";
import { atualizarCliente, buscarCliente, criarCliente } from "../../services/clientes";
import { ApiError } from "../../services/api";
import { somenteNumeros, validarCpf, validarEmail } from "../../utils/validacoes";
import { mascararCpf, mascararTelefone } from "../../utils/mascaras";

type FormCliente = {
    nome: string;
    documento: string;
    email: string;
    telefone: string;
    observacoes: string;
};

type Erros = {
    nome?: string;
    documento?: string;
    email?: string;
    telefone?: string;
};

const formVazio: FormCliente = {
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    observacoes: "",
};

export function ClienteForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormCliente>(formVazio);
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(id !== undefined);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        let ativo = true;

        buscarCliente(Number(id))
            .then((cliente) => {
                if (ativo) {
                    setForm({
                        nome: cliente.nome,
                        documento: mascararCpf(cliente.documento),
                        email: cliente.email,
                        telefone: mascararTelefone(cliente.telefone),
                        observacoes: cliente.observacoes ?? "",
                    });
                    setCarregando(false);
                }
            })
            .catch((erroApi) => {
                if (ativo) {
                    setErroGeral(
                        erroApi instanceof ApiError
                            ? erroApi.message
                            : "Erro inesperado. Tente novamente."
                    );
                    setCarregando(false);
                }
            });

        return () => {
            ativo = false;
        };
    }, [id]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};
        const nome = form.nome.trim();
        const email = form.email.trim();
        const telefone = somenteNumeros(form.telefone);

        if (nome === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.length < 3 || nome.length > 180) {
            novosErros.nome = "O nome deve ter entre 3 e 180 caracteres.";
        }

        if (form.documento === "") {
            novosErros.documento = "Informe o CPF.";
        } else if (!validarCpf(form.documento)) {
            novosErros.documento = "CPF inválido.";
        }

        if (email === "") {
            novosErros.email = "Informe o e-mail.";
        } else if (!validarEmail(email)) {
            novosErros.email = "E-mail inválido.";
        }

        if (telefone !== "" && telefone.length < 10) {
            novosErros.telefone = "Informe o telefone com DDD.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        const dados = {
            nome,
            documento: somenteNumeros(form.documento),
            email,
            telefone: form.telefone,
            observacoes: form.observacoes.trim(),
        };

        setEnviando(true);
        try {
            if (id === undefined) {
                await criarCliente(dados);
            } else {
                await atualizarCliente(Number(id), dados);
            }
            navigate("/admin/clientes");
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

    if (carregando) {
        return <p role="status">Carregando...</p>;
    }

    return (
        <div>
            <h1>{id === undefined ? "Novo cliente" : "Editar cliente"}</h1>

            <form onSubmit={handleSubmit} noValidate className="formulario">
                <Input
                    type="text"
                    placeholder="Nome completo"
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: event.target.value })}
                    erro={erros.nome}
                />

                <Input
                    type="text"
                    placeholder="CPF"
                    value={form.documento}
                    onChange={(event) =>
                        setForm({ ...form, documento: mascararCpf(event.target.value) })
                    }
                    erro={erros.documento}
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
                    placeholder="Telefone (opcional)"
                    value={form.telefone}
                    onChange={(event) =>
                        setForm({ ...form, telefone: mascararTelefone(event.target.value) })
                    }
                    erro={erros.telefone}
                />

                <Input
                    type="text"
                    placeholder="Observações (opcional)"
                    value={form.observacoes}
                    onChange={(event) => setForm({ ...form, observacoes: event.target.value })}
                />

                {erroGeral && (
                    <p role="alert" className="form-alert">
                        {erroGeral}
                    </p>
                )}

                <div className="form-actions">
                    <Botao type="submit" disabled={enviando}>
                        Salvar
                    </Botao>
                    <Link to="/admin/clientes">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}