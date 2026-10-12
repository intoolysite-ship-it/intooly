// أنواع البيانات المستخدمة في أداة توليد الصور بالذكاء الاصطناعي

export type StyleKey =
  | 'realistic'
  | 'digital'
  | 'anime'
  | 'watercolor'
  | 'oil'
  | '3d'
  | 'minimal'
  | 'fantasy';

export type RatioKey = '1:1' | '4:3' | '3:4' | '16:9';

export type HistoryItem = {
  id: string;
  prompt: string;
  dataUrl: string;
  createdAt: number;
};

export type PipelineOptions = {
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  width?: number;
  height?: number;
  seed?: number;
};

export type RawImageLike = {
  toCanvas: () => HTMLCanvasElement;
  width?: number;
  height?: number;
};

export type PipelineOutput = {
  images: RawImageLike[];
};

export type PipelineFn = (
  prompt: string,
  options?: PipelineOptions
) => Promise<PipelineOutput>;

export type ProgressCallback = (progress: {
  progress?: number;
  status?: string;
}) => void;

export type EngineModule = {
  AutoPipelineForImageGeneration: {
    from_pretrained: (
      model: string,
      options?: Record<string, unknown>
    ) => Promise<PipelineFn>;
  };
};
