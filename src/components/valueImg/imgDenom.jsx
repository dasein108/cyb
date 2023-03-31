import { useEffect, useState, useCallback } from 'react';
import useIpfs from 'src/hooks/useIpfs';
import { getAvatarIpfs } from '../../utils/search/utils';
import { trimString } from '../../utils/utils';
import Tooltip from '../tooltip/tooltip';

import eth from '../../image/Ethereum_logo_2014.svg';
import pool from '../../image/gravitydexPool.png';
import ibc from '../../image/ibc-unauth.png';
import voltImg from '../../image/lightning2.png';
import amperImg from '../../image/light.png';
import hydrogen from '../../image/hydrogen.svg';
import tocyb from '../../image/boot.png';
import boot from '../../image/large-green.png';
import pussy from '../../image/large-purple-circle.png';
import defaultImg from '../../image/large-orange-circle.png';

const getNativeImg = (text) => {
  let img = null;

  switch (text) {
    case 'millivolt':
    case 'V':
      img = voltImg;
      break;

    case 'milliampere':
    case 'A':
      img = amperImg;
      break;

    case 'hydrogen':
    case 'H':
      img = hydrogen;
      break;

    case 'liquidpussy':
    case 'LP':
      img = hydrogen;
      break;

    case 'boot':
    case 'BOOT':
      img = boot;

      break;

    case 'pussy':
    case 'PUSSY':
      img = pussy;

      break;

    case 'tocyb':
    case 'TOCYB':
      img = tocyb;
      break;

    case 'eth':
    case 'ETH':
      img = eth;
      break;

    default:
      img = defaultImg;
  }
  return img;
};

function ImgDenom({
  coinDenom,
  marginImg,
  size,
  zIndexImg,
  tooltipStatus,
  infoDenom,
}) {
  const [imgDenom, setImgDenom] = useState(null);
  const [tooltipText, setTooltipText] = useState(coinDenom);

  const { node } = useIpfs();

  useEffect(() => {
    if (
      infoDenom &&
      Object.prototype.hasOwnProperty.call(infoDenom, 'coinImageCid')
    ) {
      const { coinImageCid, path, native } = infoDenom;
      if (coinImageCid && coinImageCid.length > 0) {
        getImgFromIpfsByCid(coinImageCid);
      } else if (native) {
        if (coinDenom.includes('pool')) {
          setImgDenom(pool);
          setTooltipText(trimString(coinDenom, 9, 9));
        } else {
          setTooltipText(infoDenom.denom);
          const nativeImg = getNativeImg(coinDenom);
          setImgDenom(nativeImg);
        }
      } else {
        setImgDenom(ibc);
      }

      if (path && path.length > 0) {
        setTooltipText(path);
      }
    } else {
      setImgDenom(defaultImg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, coinDenom, infoDenom]);

  const getImgFromIpfsByCid = useCallback(
    async (cidAvatar) => {
      if (cidAvatar) {
        const responseImg = await getAvatarIpfs(cidAvatar, node);
        if (responseImg && responseImg !== null) {
          setImgDenom(responseImg);
        }
      }
    },
    [node]
  );

  if (tooltipStatus) {
    return (
      <div>
        <Tooltip placement="top" tooltip={<div>{tooltipText}</div>}>
          <img
            style={{
              margin: marginImg || 0,
              width: size || 20,
              height: size || 20,
              // objectFit: 'cover',
              zIndex: zIndexImg || 0,
            }}
            src={imgDenom !== null ? imgDenom : defaultImg}
            alt="text"
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <img
        style={{
          margin: marginImg || 0,
          width: size || 20,
          height: size || 20,
          // objectFit: 'cover',
          zIndex: zIndexImg || 0,
        }}
        src={imgDenom !== null ? imgDenom : defaultImg}
        alt="text"
      />
    </div>
  );
}

export default ImgDenom;
