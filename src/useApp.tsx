import { FocusEvent, ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react';

import generateHUB3 from './generateHUB3';

const STORAGE_KEY = 'uplatimi-data';

type Data = {
  amount: string;
  purpose: string;
  description: string;
  iban: string;
  model: string;
  reference: string;
  receiverName: string;
  receiverStreet: string;
  receiverPlace: string;
};

type UseAppResponse = {
  data: Data;
  generatedLink: string;
  handleAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCopy: () => void;
  handleLinkFocus: (event: FocusEvent<HTMLInputElement>) => void;
  handleTextChange: (limit: number) => (event: ChangeEvent<HTMLInputElement>) => void;
  hasError: boolean;
  hasLoaded: boolean;
  linkInputRef: RefObject<HTMLInputElement>;
  paymentData: Data | null;
};

const useApp = (): UseAppResponse => {
  const [data, setData] = useState<Data>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '""') || {
      amount: '',
      purpose: '',
      description: '',
      iban: '',
      model: 'HR99',
      reference: '',
      receiverName: '',
      receiverStreet: '',
      receiverPlace: '',
    }
  );
  const [paymentData, setPaymentData] = useState<Data | null>(null);
  const [generatedLink, setGeneratedLink] = useState(window.location.origin);
  const [hasError, setHasError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());

      if (params.payment) {
        const parsedData = JSON.parse(atob(params.payment));

        setPaymentData(parsedData);
        generateHUB3(parsedData);
      }
    } catch (error) {
      setHasError(true);
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (!params.payment) {
      const stringifiedData = JSON.stringify(data);

      localStorage.setItem(STORAGE_KEY, stringifiedData);

      setGeneratedLink(`${window.location.origin}?payment=${btoa(stringifiedData)}`);

      generateHUB3(data);
    }
  }, [data]);

  const handleAmountChange = useCallback(({ target: { value } }) => {
    let amount = value.replace(/[^0-9.,]/gi, '');

    if (amount) {
      if (amount.includes(',') || amount.includes('.')) {
        const parts = amount.split(/[,.]/);

        amount = `${parseInt(parts[0], 10)}.${parts[1] ? parts[1].slice(0, 2) : ''}`;
      } else {
        amount = parseInt(amount, 10).toString();
      }
    }

    setData((current) => ({ ...current, amount: amount.slice(0, 15) }));
  }, []);

  const handleTextChange = useCallback(
    (limit: number) => (event: ChangeEvent<HTMLInputElement>) => {
      setData((current) => ({ ...current, [event.target.id]: event.target.value.slice(0, limit) }));
    },
    []
  );

  const handleLinkFocus = useCallback((event: FocusEvent<HTMLInputElement>) => event.target.select(), []);

  const handleCopy = useCallback(() => {
    linkInputRef?.current?.focus();
    linkInputRef?.current?.select();
    document.execCommand('copy');
  }, [linkInputRef]);

  return {
    data,
    generatedLink,
    handleAmountChange,
    handleCopy,
    handleLinkFocus,
    handleTextChange,
    hasError,
    hasLoaded,
    linkInputRef,
    paymentData,
  };
};

export default useApp;
