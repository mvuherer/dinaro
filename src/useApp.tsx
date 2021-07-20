import { FocusEvent, ChangeEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import _deburr from 'lodash/deburr';

import generateHUB3 from './generateHUB3';

const STORAGE_KEY = 'uplatimi-data';
const QUERY_KEY = 'p';

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
  handleGenerateLink: () => void;
  handleLinkFocus: (event: FocusEvent<HTMLInputElement>) => void;
  handleTextChange: (limit: number) => (event: ChangeEvent<HTMLInputElement>) => void;
  hasFailedToGenerateLink: boolean;
  hasPageLoaded: boolean;
  isLinkGenerating: boolean;
  isLinkInvalid: boolean;
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
  const [isLinkGenerating, setIsLinkGenerating] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [hasFailedToGenerateLink, setHasFailedToGenerateLink] = useState(false);
  const [hasPageLoaded, setHasPageLoaded] = useState(false);

  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());

      if (params[QUERY_KEY]) {
        const parsedData = JSON.parse(atob(params[QUERY_KEY]));

        setPaymentData(parsedData);
        generateHUB3(parsedData);
      }
    } catch (error) {
      setIsLinkInvalid(true);
    }

    setHasPageLoaded(true);
  }, []);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (!params[QUERY_KEY]) {
      localStorage.setItem(STORAGE_KEY, _deburr(JSON.stringify(data)));

      setGeneratedLink('');

      generateHUB3(data);
    }
  }, [data]);

  const handleAmountChange = useCallback(({ target: { value } }) => {
    let amount: string = value.replace(/[^0-9.,]/gi, '');

    if (amount) {
      if (amount.includes(',') || amount.includes('.')) {
        const parts = amount.split(/[,.]/);

        amount = `${parseInt(parts[0], 10)}.${parts[1] ? parts[1].slice(0, 2) : ''}`;
      } else {
        amount = parseInt(amount, 10).toString();
      }
    }

    setData((current: Data) => ({ ...current, amount: amount.slice(0, 15) }));
  }, []);

  const handleTextChange = useCallback(
    (limit: number) => (event: ChangeEvent<HTMLInputElement>) => {
      setData((current: Data) => ({ ...current, [event.target.id]: _deburr(event.target.value.slice(0, limit)) }));
    },
    []
  );

  const handleLinkFocus = useCallback((event: FocusEvent<HTMLInputElement>) => event.target.select(), []);

  const handleCopy = useCallback(() => {
    linkInputRef?.current?.focus();
    linkInputRef?.current?.select();
    document.execCommand('copy');
  }, [linkInputRef]);

  const handleGenerateLink = useCallback(() => {
    setIsLinkGenerating(true);

    const details: { [key: string]: string } = {
      action: 'shorturl',
      format: 'json',
      keyword: 'test',
      url: `${window.location.origin}?${QUERY_KEY}=${btoa(localStorage.getItem(STORAGE_KEY) || '')}`,
    };

    const formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }

    fetch('https://uplatimi.com/u/yourls-api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody.join('&'),
    })
      .then((response) => {
        setHasFailedToGenerateLink(false);

        return response.json().then((response) => setGeneratedLink(response.shorturl));
      })
      .catch(() => setHasFailedToGenerateLink(true))
      .then(() => setIsLinkGenerating(false));
  }, []);

  return {
    data,
    generatedLink,
    handleAmountChange,
    handleCopy,
    handleGenerateLink,
    handleLinkFocus,
    handleTextChange,
    hasFailedToGenerateLink,
    hasPageLoaded,
    isLinkGenerating,
    isLinkInvalid,
    linkInputRef,
    paymentData,
  };
};

export default useApp;
