import { INavigation } from "./navigation.interface";
import { Navigation } from "./navigation.model";


const createNavigation = async (
  data:INavigation
) => {

//   const navigation = new Navigation({
//     ...data
//   });

const navigation = new Navigation({...data});
  const result = await navigation.save();

  return result;
};


const getNavigationMenuService = async (
) => {

    const result = await Navigation.find();
  

    return result;
};

const deleteNavigationMenuService = async (id:string) => {
   
    try{
        await Navigation.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }


};

// export const navigationUpdateService = async (data: INavigation) => {
//   // If you want to update an existing menu instead of creating a new one:
//   if (data._id) {
//     const result = await Navigation.findByIdAndUpdate(
//       data._id,
//       { $set: data },
//       { new: true, runValidators: true }
//     );
//     return result;
//   }

//   // Otherwise, create a new record
//   const navigation = new Navigation(data);
//   const result = await navigation.save();
//   return result;
// };

export const NavigationService = {
    createNavigation,
    getNavigationMenuService,
    deleteNavigationMenuService,
    // navigationUpdateService
}
