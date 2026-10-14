import { CertificateFieldAlign } from './certificate-field-align.enum';

export interface CertificateTemplateFieldModel {
  key: string;
  text: string | null;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  fontSizePt: number;
  fontColor: string;
  bold: boolean;
  align: CertificateFieldAlign;
  fontFamily: string | null;
}
