export function mascararCpf(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    return numeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function mascararMoeda(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 12);

    if (numeros === "") {
        return "";
    }

    return (Number(numeros) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export function moedaParaNumero(valor: string) {
    const numeros = valor.replace(/\D/g, "");

    if (numeros === "") {
        return null;
    }

    return Number(numeros) / 100;
}

export function mascararTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 10) {
        return numeros
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
}