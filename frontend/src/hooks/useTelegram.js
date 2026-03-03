const tg = window.Telegram.WebApp;

export function useTelegram() {
  const Back = () => {
    tg.BackButton();
  };

  const onClose = () => {
    tg.close();
  };

  return {
    Back,
    onClose,
    tg,
    user: tg.initDataUnsafe?.user,
    username: tg.initDataUnsafe?.username,
    user_id: tg.initDataUnsafe?.id,
    first_name: tg.initDataUnsafe?.first_name,
    last_name: tg.initDataUnsafe?.last_name,
    queryId: tg.initDataUnsafe?.query_id,
  };
}
