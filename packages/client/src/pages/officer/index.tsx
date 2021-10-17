import * as React from "react";
import { Layout } from "components/Layout";
import { StatusesArea } from "components/leo/StatusesArea";
import { useAreaOfPlay } from "hooks/useAreaOfPlay";
import { getSessionUser } from "lib/auth";
import { handleRequest } from "lib/fetch";
import { getTranslations } from "lib/getTranslation";
import { GetServerSideProps } from "next";
import { useLeoState } from "state/leoState";
import { Officer } from "types/prisma";
import { SelectOfficerModal } from "components/leo/SelectOfficerModal";
import { ActiveCalls } from "components/leo/ActiveCalls";
import { Full911Call, FullBolo, useDispatchState } from "state/dispatchState";
import { ModalButtons } from "components/leo/ModalButtons";
import { ActiveBolos } from "components/active-bolos/ActiveBolos";

interface Props {
  officers: Officer[];
  activeOfficer: Officer | null;
  calls: Full911Call[];
  bolos: FullBolo[];
}

export default function OfficerDashboard({ officers, bolos, calls, activeOfficer }: Props) {
  const { showAop, areaOfPlay } = useAreaOfPlay();
  const state = useLeoState();
  const { setCalls, setBolos } = useDispatchState();

  React.useEffect(() => {
    state.setActiveOfficer(activeOfficer);
    state.setOfficers(officers);
    setCalls(calls);
    setBolos(bolos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.setActiveOfficer,
    state.setOfficers,
    setBolos,
    setCalls,
    bolos,
    calls,
    officers,
    activeOfficer,
  ]);

  return (
    <Layout>
      <div className="w-full bg-gray-200/80 rounded-md overflow-hidden">
        <header className="px-4 py-2 bg-gray-300 mb-2">
          <h3 className="text-xl font-semibold">
            {"Utility Panel"}
            {showAop ? <span> - AOP: {areaOfPlay}</span> : null}
          </h3>
        </header>

        <div className="px-4">
          <ModalButtons />
        </div>

        <StatusesArea />
      </div>

      <ActiveCalls />
      <ActiveBolos />

      <SelectOfficerModal />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, locale }) => {
  const { data: officers } = await handleRequest("/leo", {
    headers: req.headers,
  }).catch(() => ({ data: [] }));

  const { data: activeOfficer } = await handleRequest("/leo/active-officer", {
    headers: req.headers,
  }).catch(() => ({ data: null }));

  const { data: values } = await handleRequest("/admin/values/codes_10?paths=penal_code").catch(
    () => ({
      data: [],
    }),
  );

  const { data: calls } = await handleRequest("/911-calls", {
    headers: req.headers,
  }).catch(() => ({
    data: [],
  }));
  const { data: bolos } = await handleRequest("/bolos", {
    headers: req.headers,
  }).catch(() => ({
    data: [],
  }));

  return {
    props: {
      session: await getSessionUser(req.headers),
      activeOfficer,
      officers,
      calls,
      bolos,
      values,
      messages: {
        ...(await getTranslations(["common"], locale)),
      },
    },
  };
};