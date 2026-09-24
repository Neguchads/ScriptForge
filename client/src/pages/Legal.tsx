import type { ReactNode } from "react";

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

function Page({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="cyber-card p-6 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h1 className="font-display font-bold text-xl gradient-text">{title}</h1>
          <p className="text-xs mt-1">Última atualização: {updated}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const contact = CONTACT ? (
  <a href={`mailto:${CONTACT}`} className="underline">{CONTACT}</a>
) : (
  <span>o contato informado pelo operador do serviço</span>
);

export function Privacy() {
  return (
    <Page title="Política de Privacidade" updated="23/09/2026">
      <Section title="1. Quais dados coletamos">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Conta:</b> nome, e-mail e senha (guardada apenas como hash, nunca em texto puro) e a data em que você aceitou estes termos.</li>
          <li><b>Uso:</b> o conteúdo que você gera e salva (ideias, roteiros, letras, preferências), histórico de buscas e de conversas com o assistente.</li>
          <li><b>YouTube (opcional):</b> se você conectar seu canal, guardamos os tokens de acesso para ler estatísticas e vídeos.</li>
        </ul>
        <p>Não usamos analytics, pixels de rastreamento nem cookies de publicidade. Usamos um único cookie essencial de sessão para manter você conectado (dura 30 dias).</p>
      </Section>
      <Section title="2. Para que usamos e base legal">
        <p>Para criar e manter sua conta, gerar o conteúdo que você pede e guardar seus projetos (execução do serviço, art. 7º, V da LGPD) e para registrar seu aceite destes termos (consentimento, art. 7º, I). Não vendemos seus dados.</p>
      </Section>
      <Section title="3. Com quem compartilhamos">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Google (Gemini):</b> o texto que você digita nos geradores é enviado para produzir a resposta.</li>
          <li><b>Pollinations.ai:</b> a descrição enviada nos geradores de imagem e de thumbnail.</li>
          <li><b>TiDB Cloud (PingCAP):</b> banco de dados onde suas informações ficam armazenadas.</li>
          <li><b>Provedor de hospedagem</b> do site, que processa as requisições.</li>
        </ul>
        <p>Alguns desses provedores ficam fora do Brasil, então há transferência internacional de dados. Não digite dados pessoais sensíveis de terceiros nos campos de texto.</p>
      </Section>
      <Section title="4. Por quanto tempo guardamos">
        <p>Enquanto sua conta existir. Ao excluir a conta, apagamos seus dados do banco. Registros técnicos do provedor de hospedagem seguem a política dele.</p>
      </Section>
      <Section title="5. Seus direitos (art. 18 da LGPD)">
        <p>Você pode confirmar o tratamento, acessar, corrigir, portar e eliminar seus dados, e revogar o consentimento. Na página <b>Perfil</b> você pode <b>exportar</b> uma cópia dos seus dados e <b>excluir a conta</b>. Para correção ou outros pedidos, fale com {contact}.</p>
      </Section>
      <Section title="6. Segurança e incidentes">
        <p>Usamos conexão criptografada, senhas com hash e limites de requisição. Em caso de incidente que possa causar risco relevante, avisaremos os afetados e a ANPD, conforme o art. 48 da LGPD.</p>
      </Section>
      <Section title="7. Contato">
        <p>Dúvidas e pedidos sobre seus dados: {contact}.</p>
      </Section>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Termos de Uso" updated="23/09/2026">
      <Section title="1. O serviço">
        <p>O ScriptForge ajuda a criar ideias, roteiros, letras, prompts e imagens com apoio de inteligência artificial. O serviço é oferecido como está, sem garantia de disponibilidade contínua.</p>
      </Section>
      <Section title="2. Conteúdo gerado por IA">
        <p>O conteúdo gerado pode conter erros, imprecisões ou semelhanças com obras existentes. Você é responsável por revisar o resultado e por usá-lo de acordo com a lei, os direitos de terceiros e as regras das plataformas onde publicar (como YouTube e serviços de streaming).</p>
      </Section>
      <Section title="3. Sua conta">
        <p>Mantenha sua senha em segurança e forneça informações verdadeiras. Você responde pelas atividades feitas na sua conta. Pode excluí-la a qualquer momento no Perfil.</p>
      </Section>
      <Section title="4. Uso proibido">
        <p>Não use o serviço para conteúdo ilegal, para assediar ou enganar pessoas, para violar direitos autorais ou para sobrecarregar o sistema (por exemplo, automatizando requisições em excesso). Podemos limitar ou encerrar contas que descumpram estas regras.</p>
      </Section>
      <Section title="5. Propriedade">
        <p>Você mantém os direitos sobre o que escreve e, nos limites da lei e das licenças das ferramentas de IA usadas, sobre o que é gerado a partir dos seus pedidos. O código e a marca do serviço pertencem ao operador.</p>
      </Section>
      <Section title="6. Limitação de responsabilidade">
        <p>Na extensão permitida pela lei, o operador não responde por danos indiretos decorrentes do uso do serviço ou do conteúdo gerado.</p>
      </Section>
      <Section title="7. Mudanças e lei aplicável">
        <p>Estes termos podem ser atualizados; mudanças relevantes serão informadas no serviço. Aplica-se a lei brasileira. Contato: {contact}.</p>
      </Section>
    </Page>
  );
}
