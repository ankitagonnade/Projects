# -*- coding: utf-8 -*-
"""Assignment1.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1d99VOtyklq_Cr_YoP_Mo-ZFLNfLd4uQo
"""

from google.colab import files
uploaded = files.upload()

import io
import pandas as pd
#data = pd.read_csv(io.BytesIO(uploaded['housing.csv']))
url = "https://raw.githubusercontent.com/ankitagonnade/ML-Dataset/main/housing.csv"
data = pd.read_csv(url)
# Dataset is now stored in a Pandas Dataframe

#display(data)
data.isnull().sum()

bedroom_median = data['total_bedrooms'].median()
bedroom_median
data['total_bedrooms'].fillna(bedroom_median, inplace=True) 
data.isnull().sum()

import seaborn as sns 
sns.heatmap(data.corr(),annot=True)

#housing = sns.load_dataset("housing.csv")
sns.pairplot(data)

#CHECKING in box plot for outliers

sns.boxplot(data=data)

#we find that there are outlier in total rooms and population and total bedrooms and median house value have to work on just two coulums to avoid

x=data.copy()

#handling outliers

#handling outliers in total_bedrooms

#no outliers
sns.scatterplot(x=x['housing_median_age'],y=x['median_house_value'])

#handling outliers in total_bedrooms
sns.scatterplot(x=x['total_bedrooms'],y=x['median_house_value'])

x[x['total_bedrooms']>=2500].shape

x=x[x['total_bedrooms']<2550]
sns.scatterplot(x=x['total_bedrooms'],y=x['median_house_value'], color='red')

#handling outliers in handling total_rooms
sns.scatterplot(x=x['total_rooms'],y=x['median_house_value'])
x[x['total_rooms']>=10000].shape

x=x[x['total_rooms']<10000]
sns.scatterplot(x=x['total_rooms'],y=x['median_house_value'], color='red')

sns.scatterplot(x=x['population'],y=x['median_house_value'])

x[x['population']>=6500].shape
x=x[x['population']<6500]

sns.scatterplot(x=x['population'],y=x['median_house_value'], color='red')

sns.scatterplot(x=x['households'],y=x['median_house_value'])

x=x[x['households']<1900]
sns.scatterplot(x=x['households'],y=x['median_house_value'], color='red')

sns.scatterplot(x=x['median_income'],y=x['median_house_value'],color='brown')
x[x['median_income']>=9].shape

x=x[x['median_income']<9]
sns.scatterplot(x=x['median_income'],y=x['median_house_value'],color='red')

x_data = x[['housing_median_age',
       'total_rooms', 'total_bedrooms',
       'median_income',
       'population',
       'households']]

y_data= x['median_house_value' ]

from sklearn.preprocessing import PolynomialFeatures
feature = PolynomialFeatures(degree=3, include_bias=True, interaction_only=False)
x_trans = feature.fit_transform(x_data)

# Data scaling
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler(copy=True, with_mean=True, with_std=True)
x_scale = scaler.fit_transform(x_trans)

from sklearn.model_selection import train_test_split
x_train , x_test , y_train , y_test = train_test_split(x_scale,y_data , test_size= 0.20)

from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(x_train,y_train)

y_test_predict = model.predict(x_test)
df = pd.DataFrame({"Y_test": y_test , "Y_pred" : y_test_predict})
df.head(10)

model.score(x_train , y_train)

model.score(x_test , y_test)

from sklearn.metrics import r2_score
from sklearn.metrics import mean_squared_error
import numpy as np
# model evaluation for training set
y_train_predict = model.predict(x_train)
rmse = (np.sqrt(mean_squared_error(y_train, y_train_predict)))
r2 = r2_score(y_train, y_train_predict)

print("The model performance for training set")
print("--------------------------------------")
print('RMSE is {}'.format(rmse))
print('R2 score is {}'.format(r2))
print("\n")

# model evaluation for testing set
y_test_predict = model.predict(x_test)
rmse = (np.sqrt(mean_squared_error(y_test, y_test_predict)))
r2 = r2_score(y_test, y_test_predict)

print("The model performance for testing set")
print("--------------------------------------")
print('RMSE is {}'.format(rmse))
print('R2 score is {}'.format(r2))

# alpha, learning_rate, shuffle, max_iterations

from sklearn.linear_model import SGDRegressor
from sklearn.metrics import r2_score
from sklearn.metrics import mean_squared_error
import numpy as np

alpha = [0.1, 0.15, 0.2]
learning_rate = 'adaptive'
shuffle = True
max_iterations = [2000, 3000,4000]


for a in alpha:
  for i in max_iterations:
    print("Alpha is", a, " max iter: ", i)
    model = SGDRegressor(alpha=a, learning_rate = learning_rate, max_iter = i)
    model.fit(x_train,y_train)
    y_test_predict = model.predict(x_test)
    y_train_predict = model.predict(x_train)
    rmse = (np.sqrt(mean_squared_error(y_train, y_train_predict)))
    r2 = r2_score(y_train, y_train_predict)

    print("The model performance for training set")
    print("--------------------------------------")
    print('RMSE is {}'.format(rmse))
    print('R2 score is {}'.format(r2))
    print("\n")

    # model evaluation for testing set
    y_test_predict = model.predict(x_test)
    rmse = (np.sqrt(mean_squared_error(y_test, y_test_predict)))
    r2 = r2_score(y_test, y_test_predict)

    print("The model performance for testing set")
    print("--------------------------------------")
    print('RMSE is {}'.format(rmse))
    print('R2 score is {}'.format(r2))

