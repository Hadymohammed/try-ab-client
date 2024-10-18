import axios from 'axios';

export class GrowthBookService {
  private static projectID = process.env.NEXT_PUBLIC_PROJECT_ID as string;


    public static async createEpisodeExperiment(episodeId:number,titles:string[]): Promise<IExperimentResponse> {
      const trackingKey = `episode-${episodeId}`;
      const experiment: IExperiment = {
        datasourceId: process.env.NEXT_PUBLIC_DATASOURCE_ID as string,
        assignmentQueryId: 'user_id',
        trackingKey: trackingKey,
        project: this.projectID,
        name: `Episode-${episodeId}`,
        metrics: ["fact__19g61wm2dmwm6p"],
        status: "running",
        autoRefresh: true,
        variations: titles.map((title,index) => ({id:index.toString(),key:index.toString(),name:title})) //key should be a number 
     }

      const res =  await this._createExperiment(experiment);
      const createdExperiment = res.experiment as IExperiment;
      const experimentId = createdExperiment.id;
      const variations = createdExperiment.variations;
      for(let i = 0; i < titles.length; i++){
        variations[i].value = titles[i]
      }
      await this._createFeatureFlag(episodeId,experimentId as string,variations);
      return {
        experimentId: experimentId as string,
        variations: variations.map(v => ({
            id: v.id,
            key: v.key,
            name: v.name,
            value: v.value
        })),
        featureFlagKey: trackingKey,
        status: 'running'
      };
    }

    private static async _createExperiment(experiment: IExperiment): Promise<any> {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_GROWTHBOOK_API_URL}/api/v1/experiments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROWTHBOOK_API_KEY}`,
            },
            body: JSON.stringify(experiment),
          });
    
          const data = await res.json();
          return data;
        } catch (error) {
          console.error("Error creating experiment:", error);
          throw error;
        }
    }

    public static async _createFeatureFlag(episodeId:number,experimentId:string,variations:IVariation[]): Promise<any> {
      console.log("Variations:",variations);

        const rules = [{
            experimentId: experimentId,
            id: '1',
            enabled: true,
            type: 'experiment-ref' as "experiment-ref",
            variations: variations.map(v => ({variationId:v.variationId as string,value:v.value as string}))
        }]
        const flag: IFeatureFlag = {
            id: `episode-${episodeId}`,
            description: `Feature flag for experiment ${experimentId}`,
            owner: 'abdelhady.elhefny@thmanyah.com',
            project: this.projectID,
            valueType: 'string',
            defaultValue: variations[0].value as string,
            environments: {
                production: {
                    enabled: true,
                    rules: rules
                },
                staging: {
                    enabled: true,
                    rules: rules
                }
            }
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_GROWTHBOOK_API_URL}/api/v1/features`,{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROWTHBOOK_API_KEY}`,
                },
                body: JSON.stringify(flag)
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Error creating feature flag:", error);
            throw error;
        }
    }
}


export interface IExperiment {
    id?: string;
    datasourceId: string;
    assignmentQueryId: string;
    trackingKey: string;
    project: string;
    name: string;
    metrics: string[];
    status: "running" | "stopped";
    autoRefresh: boolean;
    variations: IVariation[];
}

export interface IVariation {
    variationId?: string;
    value?: string;
    id: string;
    key: string;
    name: string;
}

export interface IFeatureFlag {
    id: string;
    description: string;
    owner: string;
    project: string;
    valueType: string;
    defaultValue: string;
    environments: {
        [key: string]: {
            enabled: boolean;
            rules: IRule[];
        };
    };
}

export interface IRule {
    experimentId: string;
    id: string;
    enabled: boolean;
    type: "experiment-ref";
    variations: IRuleVariation[];
}

export interface IRuleVariation {
    variationId: string;
    value: string;
}

export interface IExperimentResponse {
    experimentId: string;
    variations: IVariation[];
    featureFlagKey: string;
    status: "running" | "stopped";
}