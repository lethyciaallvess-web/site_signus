import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Botao } from "../../components/Botao";
import { EditorItens } from "../../components/EditorItens";
import type { LinhaItem } from "../../components/EditorItens";
import { atualizarEvento, buscarEvento, criarEvento } from "../../services/eventos";
import type { StatusEvento } from "../../services/eventos";
import { listarClientes } from "../../services/clientes";
import type { Cliente } from "../../services/clientes";
import { listarPlanos } from "../../services/planos";
import type { Plano } from "../../services/planos";
import { listarItens } from "../../services/itens";
import { ApiError } from "../../services/api";
import { mascararMoeda, mascararTexto, moedaParaNumero } from "../../utils/mascaras";
import { validarTexto } from "../../utils/validacoes";
import { proximosStatus, rotulosStatus } from "../../utils/formatacoes";

type FormEvento = {
    nome: string;
    clienteId: string;
    planoId: string;
    dataInicio: string;
    dataFim: string;
    localEvento: string;
    valorNegociado: string;
    observacoes: string;
    status: StatusEvento;
};

type Erros = {
    nome?: string;
    clienteId?: string;
    dataInicio?: string;
    dataFim?: string;
    localEvento?: string;
    itens?: string;
};

type Opcao = {
    valor: string;
    texto: string;
};

const formVazio: FormEvento = {
    nome: "",
    clienteId: "",
    planoId: "",
    dataInicio: "",
    dataFim: "",
    localEvento: "",
    valorNegociado: "",
    observacoes: "",
    status: "ORCAMENTO",
};

export function EventoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormEvento>(formVazio);
    const [linhas, setLinhas] = useState<LinhaItem[]>([]);
    const [opcoesItens, setOpcoesItens] = useState<Opcao[]>([]);
    const [statusOriginal, setStatusOriginal] = useState<StatusEvento>("ORCAMENTO");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [planos, setPlanos] = useState<Plano[]>([]);
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        let ativo = true;

        Promise.all([
            listarClientes(1, 100),
            listarPlanos(1, 100),
            listarItens(1, 100),
            id !== undefined ? buscarEvento(Number(id)) : Promise.resolve(null),
        ])
            .then(([listaClientes, listaPlanos, listaItens, evento]) => {
                if (!ativo) {
                    return;
                }

                setClientes(listaClientes.dados);
                setPlanos(
                    listaPlanos.dados.filter(
                        (plano) => plano.ativo || plano.id === evento?.planoId
                    )
                );
                setOpcoesItens(
                    listaItens.dados.map((item) => ({
                        valor: String(item.id),
                        texto: `${item.codigo} - ${item.nome}`,
                    }))
                );

                if (evento) {
                    setStatusOriginal(evento.status);
                    setForm({
                        nome: evento.nome,
                        clienteId: String(evento.clienteId),
                        planoId: evento.planoId === null ? "" : String(evento.planoId),
                        dataInicio: evento.dataInicio.slice(0, 16),
                        dataFim: evento.dataFim.slice(0, 16),
                        localEvento: evento.localEvento,
                        valorNegociado:
                            evento.valorNegociado === null
                                ? ""
                                : mascararMoeda(String(Math.round(evento.valorNegociado * 100))),
                        observacoes: evento.observacoes ?? "",
                        status: evento.status,
                    });
                    setLinhas(
                        evento.itensExtras.map((item) => ({
                            itemId: String(item.itemId),
                            quantidade: String(item.quantidade),
                        }))
                    );
                }

                setCarregando(false);
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
        const localEvento = form.localEvento.trim();

        if (nome === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.length < 3 || nome.length > 180) {
            novosErros.nome = "O nome deve ter entre 3 e 180 caracteres.";
        } else if (!validarTexto(nome)) {
            novosErros.nome = "Use apenas letras, números, espaço, ponto, vírgula e hífen.";
        }

        if (form.clienteId === "") {
            novosErros.clienteId = "Escolha o cliente.";
        }

        if (form.dataInicio === "") {
            novosErros.dataInicio = "Informe o início.";
        }

        if (form.dataFim === "") {
            novosErros.dataFim = "Informe o fim.";
        } else if (form.dataInicio !== "" && form.dataFim < form.dataInicio) {
            novosErros.dataFim = "O fim deve ser igual ou posterior ao início.";
        }

        if (localEvento === "") {
            novosErros.localEvento = "Informe o local.";
        } else if (localEvento.length < 3 || localEvento.length > 255) {
            novosErros.localEvento = "O local deve ter entre 3 e 255 caracteres.";
        } else if (!validarTexto(localEvento)) {
            novosErros.localEvento = "Use apenas letras, números, espaço, ponto, vírgula e hífen.";
        }

        const idsUsados = linhas.map((linha) => linha.itemId);

        if (linhas.some((linha) => linha.itemId === "")) {
            novosErros.itens = "Selecione o item em todas as linhas.";
        } else if (linhas.some((linha) => Number(linha.quantidade) < 1)) {
            novosErros.itens = "A quantidade deve ser no mínimo 1.";
        } else if (new Set(idsUsados).size !== idsUsados.length) {
            novosErros.itens = "Não repita o mesmo item.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        const dados = {
            nome,
            localEvento,
            clienteId: Number(form.clienteId),
            planoId: form.planoId === "" ? null : Number(form.planoId),
            dataInicio: form.dataInicio,
            dataFim: form.dataFim,
            valorNegociado: moedaParaNumero(form.valorNegociado),
            observacoes: form.observacoes.trim(),
            status: id === undefined ? undefined : form.status,
            itensExtras: linhas.map((linha) => ({
                itemId: Number(linha.itemId),
                quantidade: Number(linha.quantidade),
            })),
        };

        setEnviando(true);
        try {
            if (id === undefined) {
                await criarEvento(dados);
            } else {
                await atualizarEvento(Number(id), dados);
            }
            navigate("/admin/eventos");
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

    const opcoesStatus = [statusOriginal, ...proximosStatus[statusOriginal]].map((status) => ({
        valor: status,
        texto: rotulosStatus[status],
    }));

    return (
        <div>
            <h1>{id === undefined ? "Novo evento" : "Editar evento"}</h1>

            <form onSubmit={handleSubmit} noValidate className="formulario">
                <Input
                    type="text"
                    placeholder="Nome do evento"
                    obrigatorio
                    maxLength={180}
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: mascararTexto(event.target.value) })}
                    erro={erros.nome}
                />

                <Select
                    rotulo="Cliente"
                    obrigatorio
                    value={form.clienteId}
                    onChange={(event) => setForm({ ...form, clienteId: event.target.value })}
                    textoVazio="Selecione o cliente"
                    opcoes={clientes.map((cliente) => ({
                        valor: String(cliente.id),
                        texto: cliente.nome,
                    }))}
                    erro={erros.clienteId}
                />

                <Select
                    rotulo="Plano"
                    value={form.planoId}
                    onChange={(event) => setForm({ ...form, planoId: event.target.value })}
                    textoVazio="Sem plano"
                    opcoes={planos.map((plano) => ({
                        valor: String(plano.id),
                        texto: plano.nome,
                    }))}
                />

                <label className="campo-rotulo">
                    Início
                    <Input
                        type="datetime-local"
                        placeholder="Início"
                        obrigatorio
                        value={form.dataInicio}
                        onChange={(event) => setForm({ ...form, dataInicio: event.target.value })}
                        erro={erros.dataInicio}
                    />
                </label>

                <label className="campo-rotulo">
                    Fim
                    <Input
                        type="datetime-local"
                        placeholder="Fim"
                        obrigatorio
                        value={form.dataFim}
                        onChange={(event) => setForm({ ...form, dataFim: event.target.value })}
                        erro={erros.dataFim}
                    />
                </label>

                <Input
                    type="text"
                    placeholder="Local do evento"
                    obrigatorio
                    maxLength={255}
                    value={form.localEvento}
                    onChange={(event) => setForm({ ...form, localEvento: mascararTexto(event.target.value) })}
                    erro={erros.localEvento}
                />

                <Input
                    type="text"
                    placeholder="Valor negociado (opcional)"
                    value={form.valorNegociado}
                    onChange={(event) =>
                        setForm({ ...form, valorNegociado: mascararMoeda(event.target.value) })
                    }
                />

                {id !== undefined && (
                    <Select
                        rotulo="Status"
                        value={form.status}
                        onChange={(event) =>
                            setForm({ ...form, status: event.target.value as StatusEvento })
                        }
                        opcoes={opcoesStatus}
                    />
                )}

                <Input
                    type="text"
                    placeholder="Observações (opcional)"
                    value={form.observacoes}
                    onChange={(event) => setForm({ ...form, observacoes: event.target.value })}
                />

                <h2>Itens extras</h2>
                <EditorItens
                    linhas={linhas}
                    opcoes={opcoesItens}
                    onChange={setLinhas}
                    erro={erros.itens}
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
                    <Link to="/admin/eventos">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}