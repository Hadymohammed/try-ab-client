// import axios from 'axios';
// import { headers } from 'next/headers';
// import posthog from 'posthog-js';

// export class PostHogService {
//   private static axiosInstance = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_POSTHOG_API_URL,
//     headers: {
//       Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
//     },
//   });

//   private static projectID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

//   private static async _createExperiment(experiment: IExperiment): Promise<any> {
//     try {
//       // const res = await this.axiosInstance.post(`/api/projects/${this.projectID}/experiments`, experiment);
//       const res = await fetch(`${process.env.NEXT_PUBLIC_POSTHOG_API_URL}/api/projects/${this.projectID}/experiments`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
//         },
//         body: JSON.stringify(experiment),
//       });

//       const data = await res.json();
//       return data;
//     } catch (error) {
//       console.error("Error creating experiment:", error);
//       throw error;
//     }
//   }

//     public static async createEpisodeExperiment(episodeId:number,titles:string[]): Promise<any> {
      

//       const control = {
//         key: 'control',
//         rollout_percentage: percent,
//       }
//       const variants = titles.slice(1)?.map((title,index) => ({ key: `variant-${index}`,rollout_percentage:percent }))
//       const experiment: IExperiment = {
//       name: `Episode-${episodeId}`,
//       description: `Experiment for episode ${episodeId}`,
//       feature_flag_key: `episode-${episodeId}`,
//       parameters: {
//           // feature_flag_variants: [control, ...variants],
//       },
//       secondary_metrics: [],
//       filters: {
//           'watched': true,
//         //   groups: [
//         //     {
//         //       properties: [],
//         //       rollout_percentage: 100,
//         //     },
//         //   ],
//         //   multivariate: {
//         //     variants: flags.map(flag => ({key:flag.key,rollout_percentage:flag.rollout_percentage}))
//         //   },
//         //   payloads: flags.reduce((acc,flag) => ({...acc,[flag.key]:flag.payload}),{})
//         // },
//         // archived: false,
//       },
//       archived: false,
//       }

//       const res =  await this._createExperiment(experiment);
//       const experimentId = res.id;
//       const featureFlagId = res.feature_flag.id;
//       await this.updateFeatureFlag(featureFlagId,flags);
//       return res;
//     }

//   //   "filters": {
//   //     "groups": [
//   //         {
//   //             "properties": [],
//   //             "rollout_percentage": 100
//   //         }
//   //     ],
//   //     "multivariate": {
//   //         "variants": [
//   //             {
//   //                 "key": "control",
//   //                 "rollout_percentage": 50
//   //             },
//   //             {
//   //                 "key": "variant-0",
//   //                 "rollout_percentage": 50
//   //             }
//   //         ]
//   //     },
//   //     "payloads":{
//   //         "control": "{\"title\":\"updated5\"}",
//   //         "variant-0": "{\"title\":\"updated6\"}"
//   //     }
//   // }
//     public static async updateFeatureFlag(id:number,flags:IFlag[]): Promise<any> {
//      const filters = {
//         groups: [
//           {
//             properties: [],
//             rollout_percentage: 100,
//           },
//         ],
//         multivariate: {
//           variants: flags.map(flag => ({key:flag.key,rollout_percentage:flag.rollout_percentage}))
//         },
//         payloads: flags.reduce((acc,flag) => ({...acc,[flag.key]:`{\"title\":\"${flag.payload.title}\"}`}),{})
//       }
//       console.log(JSON.stringify(filters));
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_POSTHOG_API_URL}/api/projects/${this.projectID}/feature_flags/${id}`, {
//           method: 'PATCH',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_API_KEY}`,
//             origin: 'http://localhost:3000'
//           },
//           body: JSON.stringify({filters}),
//         });

//         const data = await res.json();
//         return data;
//       } catch (error) {
//         console.error("Error updating feature flag:", error);
//         throw error
//      }
//     }

// }

// export interface IExperiment {
//   name: string;
//   description: string;
//   start_date?: string;
//   end_date?: string;
//   feature_flag_key: string;
//   parameters: any; // Adjust the type based on your parameter structure
//   secondary_metrics?: any; // Adjust the type based on your metrics structure
//   filters?: any; // Adjust the type based on your filters structure
//   archived: boolean;
// }

// export interface IFlag {
//   key: string;
//   rollout_percentage: number;
//   payload?: any;
// }